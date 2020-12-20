import request from 'supertest';

import { app } from '../../app';


describe('Signup route', () => {
    it('returns a 201 on successful signup', async () => {
        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'rest@test.com',
                password: 'password'
            })
            .expect(201);
    });
    
    it('returns 400 for with an invalid email', async () => {
        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'resttest.com',
                password: 'password'
            })
            .expect(400);
    });
    
    it('returns 400 for with an invalid password', async () => {
        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'rest@test.com',
                password: 'p'
            })
            .expect(400);
    });
    
    it('returns 400 for with an missing password', async () => {
        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'rest@test.com',
            })
            .expect(400);
    });
    
    it('returns 400 for with an missing email', async () => {
        await request(app)
            .post('/api/users/signup')
            .send({
                password: 'password',
            })
            .expect(400);
    });
    
    it('returns 400 for an existing user', async () => {
        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'rest@test.com',
                password: 'password'
            })
            .expect(201);

        await request(app)
            .post('/api/users/signup')
            .send({
                email: 'rest@test.com',
                password: 'password'
            })
            .expect(400);
    });

    it('sets a cookie after succsessful signup', async () => {
        const response = await request(app)
            .post('/api/users/signup')
            .send({
                email: 'rest@test.com',
                password: 'password'
            });

        expect(response.get('Set-Cookie')).toBeDefined();
    });
});
