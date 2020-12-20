import { TicketUpdatedEvent } from '@kvoronovichtickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticketId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        id: ticketId,
        price: 10,
        title: 'concert'
    });

    await ticket.save();

    const data: TicketUpdatedEvent['data'] = {
        version: 1,
        id: ticketId,
        title: 'concert',
        price: 100,
        userId
    };

    // @ts-ignore 
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('finds and updates the ticket', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);

    expect(ticket!.title).toEqual(data.title)
    expect(ticket!.price).toEqual(data.price)
});

it('throws an error if ticket is not found due to version number', async () => {
    const { listener, data, msg } = await setup();

    try {
        await listener.onMessage({ ...data, version: 22 }, msg);
    } catch (e) {}
    expect(msg.ack).not.toHaveBeenCalled()
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});