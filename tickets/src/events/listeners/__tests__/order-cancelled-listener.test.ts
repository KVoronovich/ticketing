import { OrderCanceledEvent } from '@kvoronovichtickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const ticket = Ticket.build({
        price: 20,
        title: 'concert',
        userId: new mongoose.Types.ObjectId().toHexString()
    });

    await ticket.save();

    const data: OrderCanceledEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            ticketId: ticket.id,
        }
    };

    // @ts-ignore 
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, ticket };
};

it('sets order id to undefined on the ticket', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(data.ticket.ticketId);

    expect(updatedTicket!.orderId).toEqual(undefined)
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticket updated event', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(ticketUpdatedData.orderId).toEqual(undefined);
});