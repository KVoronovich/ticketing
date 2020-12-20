import request from 'supertest';
import mongoose from 'mongoose'

import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

describe('Update ticket route', () => {
    it('returns 404 if ticket is not found', async () => {
        const id = mongoose.Types.ObjectId().toHexString();
        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', global.signin())
            .send({
                title: 'title',
                price: 11
            })
            .expect(404)
    });

    it('returns 401 if the user is not authenticated', async () => {
        const id = mongoose.Types.ObjectId().toHexString();
        await request(app)
            .put(`/api/tickets/${id}`)
            .send({
                title: 'title',
                price: 11
            })
            .expect(401)
    });

    it('returns 401 if the user does not own the ticket', async () => {
        const price = 10;
        const title = 'title';
        const cookie = global.signin();
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title, price })
            .expect(201);

        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', global.signin())
            .send({
                title: 'title',
                price: 11
            })
            .expect(401)
    });

    it('returns 400 if the user provides invalid price or title', async () => {
        const cookie = global.signin();
        const price = 10;
        const title = 'title';
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title, price })
            .expect(201);

        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', global.signin())
            .send({
                title: 'title',
                price: -11
            })
            .expect(400)

        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', global.signin())
            .send({
                title: 'title'
            })
            .expect(400)

        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', global.signin())
            .send({
                title: '',
                price: -11
            })
            .expect(400)

        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', global.signin())
            .send({
                price: -11
            })
            .expect(400)

        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', global.signin())
            .send({})
            .expect(400)
    });


    it('returns updated ticket', async () => {
        const price = 10;
        const title = 'title';
        const updatetTitle = 'New Title';
        const updatedPrice = 11;
        const cookie = global.signin();
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title, price })
            .expect(201);
        const id = response.body.id;



        const ticketResponse = await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', cookie)
            .send({ title: updatetTitle, price: updatedPrice })
            .expect(200);
        
        expect(ticketResponse.body.title).toEqual(updatetTitle);
        expect(ticketResponse.body.price).toEqual(updatedPrice);
    });

    it('publishes an event', async () => {
        const price = 10;
        const title = 'title';
        const updatetTitle = 'New Title';
        const updatedPrice = 11;
        const cookie = global.signin();
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title, price })
            .expect(201);
        const id = response.body.id;



        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', cookie)
            .send({ title: updatetTitle, price: updatedPrice })
            .expect(200);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });

    it('rejects update if ticket is reserved', async () => {
        const price = 10;
        const title = 'title';
        const updatetTitle = 'New Title';
        const updatedPrice = 11;
        const cookie = global.signin();
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title, price })
            .expect(201);
        const id = response.body.id;

        const ticket = await Ticket.findOne({ title, price });
        ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
        await ticket!.save();

        await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', cookie)
            .send({ title: updatetTitle, price: updatedPrice })
            .expect(400);
    });
});