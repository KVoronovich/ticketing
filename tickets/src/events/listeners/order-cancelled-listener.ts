import { Listener, OrderCanceledEvent, Subjects } from '@kvoronovichtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCanceledEvent> {
    readonly subject = Subjects.OrderCanceled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCanceledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.ticketId);

        if (!ticket) {
            throw new Error('ticket not found');
        }

        ticket.set({ orderId: undefined });
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