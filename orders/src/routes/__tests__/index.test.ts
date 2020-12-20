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

describe('list orders route', () => {
    it('fetches orders for particular user', async () => {
        const ticketOne = await buildTicket();
        const ticketTwo = await buildTicket();
        const ticketTree = await buildTicket();

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

            const { body: orderThree } = await request(app)
            .post('/api/orders')
            .set('Cookie', userTwo)
            .send({ ticketId: ticketTree.id })
            .expect(201);

        const responseUserOne = await request(app)
            .get('/api/orders')
            .set('Cookie', userOne)
            .expect(200);

        const responseUserTwo = await request(app)
            .get('/api/orders')
            .set('Cookie', userTwo)
            .expect(200);

        expect(responseUserOne.body.length).toEqual(1);
        expect(responseUserTwo.body.length).toEqual(2);

        expect(responseUserOne.body[0].id).toEqual(orderOne.id);
        expect(responseUserTwo.body[0].id).toEqual(orderTwo.id);
        expect(responseUserTwo.body[1].id).toEqual(orderThree.id);
    });
});