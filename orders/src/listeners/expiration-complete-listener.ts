import { Message } from 'node-nats-streaming';
import {
  Listener,
  ExpirationCompleteEvent,
  Subjects,
  OrderStatus,
} from '@grider-courses/common';
import { queueGroupName } from '../listeners/queue-group-name';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { Order } from '../models/orders';
import { natsWrapper } from '../nats-wrapper';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    // console.log(`Handling ${this.subject} with msg`, data);
    const { orderId } = data;
    console.log('Got an expiration');
    const order = await Order.findById(orderId).populate('ticket');

    if (order && order.status !== OrderStatus.Complete) {
      // Update the status
      order.set({ status: OrderStatus.Cancelled });
      await order.save();
      console.log(`Order ${order.id} should be cancelled`);

      // Tell the world we have cancelled.
      const { userId, ticket, version } = order;
      new OrderCancelledPublisher(natsWrapper.client).publish({
        id: orderId,
        userId,
        version,
        ticket,
      });
    }

    msg.ack(); // success
  }
}
