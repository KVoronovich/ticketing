import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';


describe('new payment route', () => {
    it('returns an error if order does not exist', async () => {
        const orderId = mongoose.Types.ObjectId().toHexString();

        await request(app)
            .post('/api/paymnets')
            .set('Cookie', global.signin())
            .send({ orderId, token: 'asdfasdasdasd' })
            .expect(404);
    });

    it('returns an error if order is created by different user', async () => {

        const orderId = mongoose.Types.ObjectId().toHexString();
        const order = Order.build({
            id: orderId,
            userId: '123123123',
            status: OrderStatus.Created,
            version: 0,
            price: 20
        });
        await order.save();

        await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin())
            .send({ orderId, token: 'asdasdasdasd'})
            .expect(401);
    });

    it('returns an error if order is cancelled', async () => {
        const orderId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();
        const order = Order.build({
            id: orderId,
            userId,
            status: OrderStatus.Canceled,
            version: 0,
            price: 20
        });
        await order.save();

        await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin(userId))
            .send({ orderId, token: 'asdasdasdasd'})
            .expect(400);
    });
});