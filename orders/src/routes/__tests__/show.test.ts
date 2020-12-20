import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    return ticket;
};

describe('show specific order route', () => {
    it('fetches order for particular user', async () => {
        const ticketOne = await buildTicket();
        const ticketTwo = await buildTicket();

        const userOne = global.signin();
        const userTwo = global.signin();

        const { body: orderOne } = await request(app)
            .post('/api/orders')
            .set('Cookie', userOne)
            .send({ ticketId: ticketOne.id })
            .expect(201);

        const { body: orderTwo } = await request(app)
            .post('/api/orders')
            .set('Cookie', userTwo)
            .send({ ticketId: ticketTwo.id })
            .expect(201);

        const responseUserOne = await request(app)
            .get(`/api/orders/${orderOne.id}`)
            .set('Cookie', userOne)
            .expect(200);

        const responseUserTwo = await request(app)
            .get(`/api/orders/${orderTwo.id}`)
            .set('Cookie', userTwo)
            .expect(200);

        expect(responseUserOne.body).toEqual(orderOne);
        expect(responseUserTwo.body).toEqual(orderTwo);
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
            .get(`/api/orders/${orderTwo.id}`)
            .set('Cookie', userOne)
            .expect(401);

    });

    it('returns 404 if order is not found', async () => {
        const userOne = global.signin();

        const randomOrderId = mongoose.Types.ObjectId();
        await request(app)
            .get(`/api/orders/${randomOrderId}`)
            .set('Cookie', userOne)
            .expect(404);
    })
});