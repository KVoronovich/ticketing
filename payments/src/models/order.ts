import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@kvoronovichtickets/common';

export { OrderStatus };

interface OrderAttrs {
    id: string;
    status: OrderStatus;
    userId: string;
    version: number;
    price: number;
}

interface OrderDoc extends mongoose.Document {
    status: OrderStatus;
    userId: string;
    version: number;
    price: number;
    id: string;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    userId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
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


orderSchema.statics.build = (attrs: OrderAttrs) => new Order({
    _id: attrs.id,
    version: attrs.version,
    userId: attrs.userId,
    price: attrs.price,
    status: attrs.status
});

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order }
