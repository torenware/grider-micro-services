import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@grider-courses/common';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Get the expire time in milliseconds.
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    await expirationQueue.add({
      orderId: data.id,
      opts: {
        delay,
      },
    });

    msg.ack();
  }
}
