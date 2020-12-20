import request from 'supertest';

import { app } from '../../app';

const signinRoute = '/api/users/signin';

describe('Signin route', () => {
    it('fails when email that does not exist is supplied', async () => {
        await request(app)
            .post(signinRoute)
            .send({
                email: 'rest@test.com',
                password: 'password'
            })
            .expect(400);
    });

    it('fails that incorrect password is supplied', async () => {
        await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);

        await request(app)
            .post(signinRoute)
            .send({
                email: 'test@test.com',
                password: 'password1'
            })
            .expect(400);
    });

    it('responds with a cookie with valid credentials', async () => {
        await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);

        const response = await request(app)
            .post(signinRoute)
            .send({
                email: 'test@test.com',
                password: 'password'
            })
            .expect(200);

        expect(response.get('Set-Cookie')).toBeDefined();
    });
});
