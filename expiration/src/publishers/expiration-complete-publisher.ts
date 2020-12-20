import { Publisher, ExpirationCompleteEvent, Subjects } from '@kvoronovichtickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
