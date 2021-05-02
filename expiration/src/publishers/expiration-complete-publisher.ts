import { Stan } from 'node-nats-streaming';
import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from '@grider-courses/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
