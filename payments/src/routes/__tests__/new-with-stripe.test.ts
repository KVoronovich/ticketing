import { stripe } from '../../stripe';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Payment } from '../../models/payment';

describe('new payment route without mocking stripe', () => {
    it('returns a 201 with valid inputs', async () => {

        const spy = jest.spyOn(stripe.charges, 'create');
        const orderId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();
        const order = Order.build({
            id: orderId,
            userId,
            status: OrderStatus.Created,
            version: 0,
            price: 20
        });
        await order.save();

        await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin(userId))
            .send({ orderId, token: 'tok_visa'})
            .expect(201);

        expect(spy).toBeCalledWith({
            currency: 'usd',
            amount: order.price * 100,
            source: 'tok_visa'  
        });
    });

    it('creates payment', async () => {

        const spy = jest.spyOn(stripe.charges, 'create');
        const orderId = mongoose.Types.ObjectId().toHexString();
        const userId = mongoose.Types.ObjectId().toHexString();
        const order = Order.build({
            id: orderId,
            userId,
            status: OrderStatus.Created,
            version: 0,
            price: 20
        });
        await order.save();

        await request(app)
            .post('/api/payments')
            .set('Cookie', global.signin(userId))
            .send({ orderId, token: 'tok_visa'})
            .expect(201);

        const response = await spy.mock.results[0].value;
        const payment = await Payment.findOne({ orderId });

        expect(payment!.stripeId).toBe(response.id);
    });
});