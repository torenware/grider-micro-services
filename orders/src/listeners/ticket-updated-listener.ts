import { Message } from 'node-nats-streaming';
import { Listener, TicketUpdatedEvent, Subjects } from '@grider-courses/common';
import { queueGroupName } from '../listeners/queue-group-name';
import { Ticket } from '../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    // console.log(`Handling ${this.subject} with msg`, data);

    const { id, title, price } = data;
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new Error('Ticket not found');
    } else {
      ticket.set({
        title,
        price,
      });
    }
    await ticket.save();

    msg.ack(); // success
  }
}
