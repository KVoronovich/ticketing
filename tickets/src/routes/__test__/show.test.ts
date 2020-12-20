import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose'

describe('Get ticket route', () => {
    it('returns 404 if ticket is not found', async () => {
        const id = mongoose.Types.ObjectId().toHexString();
        await request(app)
            .get(`/api/tickets/${id}`)
            .expect(404)
    });

    it('returns a ticket if it exists', async () => {
        const price = 10;
        const title = 'title';
        const cookie = global.signin();
        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', cookie)
            .send({ title, price })
            .expect(201);
        const id = response.body.id;

        const ticketResponse = await request(app)
            .get(`/api/tickets/${id}`)
            .expect(200);
        
        expect(ticketResponse.body.title).toEqual(title);
        expect(ticketResponse.body.price).toEqual(price);
    });
});