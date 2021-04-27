import { Message } from 'node-nats-streaming';
import { Listener, Subjects, TicketCreatedEvent } from '@grider-courses/common';

class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // Nail down subject. This would be "final" in Java.
  readonly subject = Subjects.TicketCreated;

  queueGroupName = 'payment-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log(`Event #${msg.getSequence()} data:`, data);

    // Test to see if TS is enforcing our type
    console.log(data.title);
    console.log(data.price);

    // And tell the server we've handled it
    msg.ack();
  }
}

export { TicketCreatedListener };
