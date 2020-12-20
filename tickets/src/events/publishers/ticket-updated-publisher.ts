import { Publisher, Subjects, TicketUpdatedEvent } from '@kvoronovichtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
