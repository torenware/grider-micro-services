import { Publisher, Subjects, OrderCreatedEvent } from '@grider-courses/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
