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

    // To support OCC, we need to check both the ticket's id
    // *and* its version. The updated version needs to be one
    // more than what we already know about. If we have received
    // this out of order, we need to throw and cope with the error.
    const ticket = await Ticket.findOne({
      _id: id,
      version: data.version - 1,
    });

    if (!ticket) {
      // Note this will skip the ack(), and force
      // the NATS server to resend the event.
      throw new Error('Ticket not found');
    } else {
      ticket.set({
        title,
        price,
        version: data.version,
      });
    }
    await ticket.save();

    msg.ack(); // success
  }
}
