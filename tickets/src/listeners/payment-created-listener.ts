import { Message } from 'node-nats-streaming';
import {
  Listener,
  PaymentCreatedEvent,
  Subjects,
  TicketStatus,
} from '@grider-courses/common';
import { queueGroupName } from '../listeners/queue-group-name';
import { Ticket } from '../models/ticket';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }
    console.log('set ticket to sold');
    ticket.set({
      status: TicketStatus.Sold,
    });
    await ticket.save();
    msg.ack();
  }
}
