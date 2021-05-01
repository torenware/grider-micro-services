import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@grider-courses/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../models/orders';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // We need to dupe the order locally.
    const {
      id,
      userId,
      status,
      version,
      ticket: { price },
    } = data;
    const order = Order.build({
      id,
      userId,
      status,
      version,
      price,
    });
    await order.save();
    msg.ack();
  }
}
