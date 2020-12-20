import request from 'supertest';
import { app } from '../../app';

describe('Get tickets list route', () => {
    it('returns a tickets if it exists', async () => {
        const price = 10;
        const title = 'title';
        const cookie = global.signin();

        const createTicket = () => {
            return request(app)
                .post('/api/tickets')
                .set('Cookie', cookie)
                .send({ title, price })
        }
        await createTicket();
        await createTicket();
        await createTicket();
        await createTicket();
        await createTicket();

        const ticketListResponse = await request(app)
            .get(`/api/tickets`)
            .expect(200);
        
        expect(ticketListResponse.body.length).toEqual(5);
    });
});