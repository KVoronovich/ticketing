import { Publisher, OrderCanceledEvent, Subjects } from '@kvoronovichtickets/common';

export class OrderCanceledPublisher extends Publisher<OrderCanceledEvent> {
    readonly subject = Subjects.OrderCanceled;
}
