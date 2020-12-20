import { Publisher, PaymentCreatedEvent, Subjects } from '@kvoronovichtickets/common';


export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}