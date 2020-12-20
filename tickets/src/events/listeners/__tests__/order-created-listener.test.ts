import { OrderCreatedEvent, OrderStatus } from '@kvoronovichtickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        price: 20,
        title: 'concert',
        userId: new mongoose.Types.ObjectId().toHexString()
    });

    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
        status: OrderStatus.Created,
        expiresAt: new Date(Date.now() + 60 * 1000 * 10).toISOString(),
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    // @ts-ignore 
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, ticket };
};

it('sets order id on the ticket', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(data.ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id)
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes tickeet updated event', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(ticketUpdatedData.orderId).toEqual(data.id);
});