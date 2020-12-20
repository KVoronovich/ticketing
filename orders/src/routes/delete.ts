import express, { Response, Request } from 'express';
import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from '@kvoronovichtickets/common';
import { Order } from '../models/order';
import { OrderCanceledPublisher } from '../publishers/order-canceled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

// should be PATCH/PUT
router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Canceled;
    await order.save();

    new OrderCanceledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            ticketId: order.ticket.id,
        },
    });
    
    res.status(204).send(order);
});

export { router as deleteOrderRouter };