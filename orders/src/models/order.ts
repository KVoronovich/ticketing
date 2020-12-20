import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@kvoronovichtickets/common';
import { TicketDoc } from './ticket';

export { OrderStatus };

interface OrderAttrs {
    expiresAt: Date;
    status: OrderStatus;
    userId: string;
    ticket: TicketDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

interface OrderDoc extends mongoose.Document {
    expiresAt: Date;
    status: OrderStatus;
    userId: string;
    ticket: TicketDoc;
    version: number;
    // diff with course
    id: string;
}

const orderSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
},
{
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);


orderSchema.statics.build = (attrs: OrderAttrs) => new Order(attrs);

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order }
