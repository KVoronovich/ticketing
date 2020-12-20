import { Listener, Subjects, OrderCreatedEvent } from '@kvoronovichtickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const { ticket: { price }, id, version, userId, status } = data;
        const order = Order.build({ version, price, id, userId, status });
        await order.save();

        msg.ack();
    }
}