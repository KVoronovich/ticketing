import { Publisher, OrderCreatedEvent, Subjects } from '@kvoronovichtickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
