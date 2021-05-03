import { Message } from 'node-nats-streaming';
import {
  Listener,
  PaymentCreatedEvent,
  Subjects,
  OrderStatus,
} from '@grider-courses/common';
import { queueGroupName } from '../listeners/queue-group-name';
import { Order } from '../models/orders';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();
    msg.ack();
  }
}
