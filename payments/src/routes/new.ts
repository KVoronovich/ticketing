import { natsWrapper } from './../nats-wrapper';
import express, { Response, Request } from 'express';
import { body } from 'express-validator';
import {
    requireAuth,
    validateRequest,
    BadRequestError,
    NotFoundError,
    NotAuthorizedError,
    OrderStatus
} from '@kvoronovichtickets/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';

const router = express.Router();

router.post(
    '/api/payments',
    requireAuth,
    [
        body('token')
            .not()
            .isEmpty(),
        body('orderId')
            .not()
            .isEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) =>  {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (order.status === OrderStatus.Canceled) {
            throw new BadRequestError('Cannot pay for a cancelled order');
        }

       const response = await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,
            source: token
        });

        const payment = Payment.build({
            stripeId: response.id,
            orderId
        });

        await payment.save();

        new PaymentCreatedPublisher(natsWrapper.client).publish(payment);

        res.status(201).send(payment);
    }
);

export { router as createChargeRouter };
