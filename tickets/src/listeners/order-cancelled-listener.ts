import { Message } from 'node-nats-streaming';
import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  TicketStatus,
} from '@grider-courses/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error('Ticket was not found');
    }
    // Remove any orderId
    ticket.set({
      orderId: null,
      status: TicketStatus.Available,
    });
    await ticket.save();
    // changed; emit an event.
    const eventData = {
      id: ticket.id,
      serial: ticket.serial,
      userId: ticket.userId,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version,
      status: ticket.status,
    };
    new TicketUpdatedPublisher(this.client).publish(eventData);
    msg.ack();
  }
}
