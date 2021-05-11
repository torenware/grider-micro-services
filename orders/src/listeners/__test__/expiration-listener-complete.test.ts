import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderStatus } from '@grider-courses/common';
import { ExpirationCompleteListener } from '../../listeners/expiration-complete-listener';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/orders';

const setUp = async () => {
  // Create the listener.
  const client = natsWrapper.client;
  const listener = new ExpirationCompleteListener(client);

  // Create an order
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    serial: 1000,
    title: 'No No Shows',
    price: 20,
  });
  await ticket.save();
  const order = Order.build({
    userId: 'some-sellah',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  const orderId = order.id!;

  // Create a fake event.
  const event = {
    orderId,
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

it('it updates an order to cancelled when it expires', async () => {
  // Verify that a ticket record was created.
  const { listener, event, msg } = await setUp();
  await listener.onMessage(event, msg);
  const order = await Order.findById(event.orderId);
  expect(order).toBeTruthy();
  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelledEvent', async () => {
  const { listener, event, msg } = await setUp();
  await listener.onMessage(event, msg);
  expect(natsWrapper.client.publish).toBeCalledTimes(1);
  const mock = natsWrapper.client.publish as jest.Mock;
  expect(mock.mock.calls[0][0]).toEqual('order:cancelled');
  console.log('params', JSON.parse(mock.mock.calls[0][1]));
});

it('calls ack on the event', async () => {
  const { listener, event, msg } = await setUp();
  await listener.onMessage(event, msg);
  // Verify that ack() was called on the mock.
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it('does not updated status if the order is already completed', async () => {
  const { listener, event, msg } = await setUp();

  const orderBefore = await Order.findById(event.orderId);
  orderBefore!.set({ status: OrderStatus.Complete });
  await orderBefore?.save();

  await listener.onMessage(event, msg);
  const order = await Order.findById(event.orderId);
  expect(order).toBeTruthy();
  expect(order!.status).toEqual(OrderStatus.Complete);
});
