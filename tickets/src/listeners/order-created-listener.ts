import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@grider-courses/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // console.log(`Processing ${this.subject} message`);
    const ticket = await Ticket.findById(data.ticket.id);
    // Could fail!
    if (ticket) {
      ticket.set({ orderId: data.id });
      await ticket.save();
      // Ticket has changed; emit an event.
      const eventData = {
        id: ticket.id,
        userId: ticket.userId,
        title: ticket.title,
        price: ticket.price,
        version: ticket.version,
      };
      new TicketUpdatedPublisher(this.client).publish(eventData);
    } else {
      throw new Error('Ticket of this ID was not found');
    }
    msg.ack();
  }
}
