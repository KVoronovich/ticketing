import { ExpirationCompleteEvent, OrderStatus, TicketCreatedEvent } from '@kvoronovichtickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 11,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'asdasdas',
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };

    // @ts-ignore 
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, order, ticket };
};

it('updates order status to cancelled', async () => {
    const { listener, data, msg, order } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Canceled);
});

it('emits the event', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);

});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});