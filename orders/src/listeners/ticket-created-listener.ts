import { Message } from 'node-nats-streaming';
import { Listener, TicketCreatedEvent, Subjects } from '@grider-courses/common';
import { queueGroupName } from '../listeners/queue-group-name';
import { Ticket } from '../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    // console.log(`Handling ${this.subject} with msg`, data);

    const { id, serial, title, price } = data;
    console.log('serial', serial);
    const ticket = Ticket.build({
      id,
      serial,
      title,
      price,
    });
    await ticket.save();

    msg.ack(); // success
  }
}
