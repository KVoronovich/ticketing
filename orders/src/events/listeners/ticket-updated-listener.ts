import { Listener, Subjects, TicketUpdatedEvent } from '@kvoronovichtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-goup-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data);
        if (!ticket) {
            throw new Error('ticket not found');
        }

        const { title, price } = data;
        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    }
}