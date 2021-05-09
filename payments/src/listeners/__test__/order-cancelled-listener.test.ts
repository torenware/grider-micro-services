import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@grider-courses/common';
import { OrderCancelledListener } from '../../listeners/order-cancelled-listener';
import { natsWrapper } from '../../nats-wrapper';
import { Order } from '../../models/orders';

const setUp = async () => {
  // Create the listener.
  const client = natsWrapper.client;
  const listener = new OrderCancelledListener(client);

  // Create a test order
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id,
    userId: 'i-got-nobody',
    ticketId,
    version: 0,
    status: OrderStatus.Created,
    price: 20,
  });
  await order.save();

  // Create a fake event.
  const event: OrderCancelledEvent['data'] = {
    id,
    userId: order.userId,
    version: 0,
    ticket: {
      id: 'unused',
    },
  };

  // Create a mocked Message. TS isn't too helpful here, so turn it
  // the fock off.
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // Call onMessage for the listener.
  // await listener.onMessage(event, msg);
  return { listener, event, msg };
};

it('causes an order to be marked cancelled', async () => {
  const { listener, event, msg } = await setUp();
  await listener.onMessage(event, msg);

  const order = await Order.findById(event.id);
  expect(order!.status).toEqual(OrderStatus.Cancelled);

  // The message is acked
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
