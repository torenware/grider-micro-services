import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

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
