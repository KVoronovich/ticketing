import request from 'supertest';

import { app } from '../../app';

const route = '/api/users/currentuser';

describe('Current user route', () => {
    it('responds with current user', async () => {
        const cookie = await global.signin();

        const response = await request(app)
            .get(route)
            .set('Cookie', cookie)
            .expect(200);

        expect(response.body.currentUser.email).toEqual('test@test.com');
    });

    it('responds with null without cookie', async () => {
        const response = await request(app)
            .get(route)
            .expect(200);

        expect(response.body.currentUser).toEqual(null);
    });
});
