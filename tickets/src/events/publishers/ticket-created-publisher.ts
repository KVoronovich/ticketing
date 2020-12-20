import { isParameter } from "typescript";

import { Publisher, Subjects, TicketCreatedEvent } from '@kvoronovichtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
