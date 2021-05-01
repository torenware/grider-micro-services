import { Message } from 'node-nats-streaming';
import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  OrderStatus,
} from '@grider-courses/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../models/orders';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Remove any orderId
    const order = await Order.findById(data.id);
    if (order) {
      order.set({ status: OrderStatus.Cancelled });
      await order.save();
    }
    msg.ack();
  }
}
