import { Listener, OrderCreatedEvent, Subjects } from '@kvoronovichtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error('ticket not found');
        }

        ticket.set({ orderId: data.id });
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            price: ticket.price,
            title: ticket.title,
            orderId: ticket.orderId,
            userId: ticket.userId
        });

        msg.ack();
    }
}