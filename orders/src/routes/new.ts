import mongoose from 'mongoose';
import express, { Response, Request } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@kvoronovichtickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const router = express.Router();

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('Ticket is must be provided')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }

        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }

        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        const order = await Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });
        await order.save();
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            version: order.version,
            ticket: {
                id: ticket.id,
                price: ticket.price
            },
            expiresAt: order.expiresAt.toISOString(),
            userId: req.currentUser!.id
        });
        res.status(201).send(order);
    }
);

export { router as newOrderRouter };
