import { Listener, Subjects, OrderCanceledEvent, NotFoundError, OrderStatus } from '@kvoronovichtickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCanceledEvent> {
    readonly subject = Subjects.OrderCanceled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCanceledEvent['data'], msg: Message) {
        const { id, version } = data;
        const order = await Order.findOne({
            _id: id,
            version: version - 1
        });

        if (!order) {
            throw new NotFoundError();
        }

        order.set({ status: OrderStatus.Canceled });
        await order.save();

        msg.ack();
    }
}