import { OrderCanceledEvent, OrderStatus } from '@kvoronovichtickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: orderId,
        status: OrderStatus.Created,
        version: 0,
        price: 10,
        userId
    });

    await order.save();

    const data: OrderCanceledEvent['data'] = {
        version: 1,
        id: orderId,
        ticket: {
            ticketId: 'asdasdasdasd',
        }
    };

    // @ts-ignore 
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('finds and updates the order', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const ticket = await Order.findById(data.id);

    expect(ticket!.status).toEqual(OrderStatus.Canceled);
});

it('throws an error if order is not found due to version number', async () => {
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