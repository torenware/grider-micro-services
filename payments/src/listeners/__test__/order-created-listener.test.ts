import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@grider-courses/common';
import { OrderCreatedListener } from '../../listeners/order-created-listener';
import { natsWrapper } from '../../nats-wrapper';
import { Order } from '../../models/orders';

const setUp = async () => {
  // Create the listener.
  const client = natsWrapper.client;
  const listener = new OrderCreatedListener(client);

  // Create a fake event.
  const id = new mongoose.Types.ObjectId().toHexString();

  const event: OrderCreatedEvent['data'] = {
    id,
    userId: 'i-got-nobody',
    version: 0,
    status: OrderStatus.Created,
    expiresAt: new Date().toISOString(),
    ticket: {
      id: 'unused',
      price: 20,
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
  // Tell us how to find the ticket.
  return { listener, event, msg };
};

it('causes an order to be created internally', async () => {
  const { listener, event, msg } = await setUp();
  await listener.onMessage(event, msg);
  const order = await Order.findById(event.id);
  expect(order).not.toBeNull();
  expect(order!.price).toEqual(event.ticket.price);

  // The message is acked
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
