import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';


const buildTicket = async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    return ticket;
};

describe('delete order route', () => {
    it('deletes order for particular user', async () => {
        const ticketOne = await buildTicket();

        const userOne = global.signin();

        const { body: orderOne } = await request(app)
            .post('/api/orders')
            .set('Cookie', userOne)
            .send({ ticketId: ticketOne.id })
            .expect(201);

        await request(app)
            .delete(`/api/orders/${orderOne.id}`)
            .set('Cookie', userOne)
            .expect(204);

        const updatedOrder = await Order.findById(orderOne.id);
        expect(updatedOrder!.status).toEqual(OrderStatus.Canceled);
    });

    it('return 401 for user that does not own the order', async () => {
        const ticketTwo = await buildTicket();

        const userOne = global.signin();
        const userTwo = global.signin();

        const { body: orderTwo } = await request(app)
            .post('/api/orders')
            .set('Cookie', userTwo)
            .send({ ticketId: ticketTwo.id })
            .expect(201);
        await request(app)
            .delete(`/api/orders/${orderTwo.id}`)
            .set('Cookie', userOne)
            .expect(401);

    });

    it('returns 404 if order is not found', async () => {
        const userOne = global.signin();

        const randomOrderId = mongoose.Types.ObjectId();
        await request(app)
            .delete(`/api/orders/${randomOrderId}`)
            .set('Cookie', userOne)
            .expect(404);
    });

    it('Emits an event', async () => {
        const ticketOne = await buildTicket();

        const userOne = global.signin();

        const { body: orderOne } = await request(app)
            .post('/api/orders')
            .set('Cookie', userOne)
            .send({ ticketId: ticketOne.id })
            .expect(201);

        await request(app)
            .delete(`/api/orders/${orderOne.id}`)
            .set('Cookie', userOne)
            .expect(204);

        expect(natsWrapper.client.publish).toBeCalled();
    });
});