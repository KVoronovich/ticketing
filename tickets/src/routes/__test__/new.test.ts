import request from 'supertest';
import { app } from '../../app';

import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('New ticket route', () => {
    it('has a route handler to listen to /api/tickets for fost request', async () => {
        const response = await request(app)
            .post('/api/tickets')
            .send({});

        expect(response.status).not.toEqual(404);
    });

    it('can only be accessed if the user is signed in', async () => {
        await request(app)
            .post('/api/tickets')
            .send({})
            .expect(401)
    });

    it('returns a status other than 401 if user is signed in', async () => {
        const cookie = global.signin();
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({});

        expect(response.status).not.toEqual(401);
    });

    it('returns an error if an invalid title is provided', async () => {
        const cookie = global.signin();
        await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title: '', price: 10 })
            .expect(400);

        await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ price: 10 })
            .expect(400);
    });

    it('returns an error if an invalid price is provided', async () => {
        const cookie = global.signin();
        await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title: 'ticket', price: -10 })
            .expect(400);

        await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title: 'ticket' })
            .expect(400);
    });

    it('creates a ticket with valid inputs', async () => {
        const price = 10;
        const title = 'title';

        let tickets = await Ticket.find({});
        expect(tickets.length).toEqual(0);

        const cookie = global.signin();
        await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title, price })
            .expect(201);

        tickets = await Ticket.find({});
        expect(tickets.length).toEqual(1);
        expect(tickets[0].price).toEqual(price);
        expect(tickets[0].title).toEqual(title);
    });

    it('publishes an event', async () => {
        const price = 10;
        const title = 'title';

        let tickets = await Ticket.find({});
        expect(tickets.length).toEqual(0);

        const cookie = global.signin();
        await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title, price })
            .expect(201);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});