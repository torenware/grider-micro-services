import { Message } from 'node-nats-streaming';
import {
  Listener,
  OrderCancelledEvent,
  Subjects,
} from '@grider-courses/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../models/ticket';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error('Ticket was not found');
    }
    // Remove any orderId
    ticket.set({ orderId: null });
    await ticket.save();
    msg.ack();
  }
}
