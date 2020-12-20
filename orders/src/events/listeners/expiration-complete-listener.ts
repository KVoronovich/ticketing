import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from '@kvoronovichtickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { OrderCanceledPublisher } from '../../publishers/order-canceled-publisher';
import { queueGroupName } from './queue-goup-name';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new Error('Order not found');
        }
        if(order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({ status: OrderStatus.Canceled });
        await order.save();

        new OrderCanceledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                ticketId: order.ticket.id
            }
        })

        msg.ack();
    }
}