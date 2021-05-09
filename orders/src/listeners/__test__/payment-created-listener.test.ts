import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { PaymentCreatedListener } from '../../listeners/payment-created-listener';
import { natsWrapper } from '../../nats-wrapper';
import { Order } from '../../models/orders';
import { Ticket } from '../../models/ticket';
import { PaymentCreatedEvent, OrderStatus } from '@grider-courses/common';

const setUp = async () => {
  // Create the listener.
  const client = natsWrapper.client;
  const listener = new PaymentCreatedListener(client);

  // Create a fake event.
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'Who is gonna pay',
    price: 13,
  });
  await ticket.save();

  const order = Order.build({
    userId: 'nobody-here',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const event: PaymentCreatedEvent['data'] = {
    id,
    orderId: order._id,
    ticketId,
    stripeId: 'some-long-id',
    version: 0,
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

it('marks the order as complete', async () => {
  const { listener, event, msg } = await setUp();
  await listener.onMessage(event, msg);
  const order = await Order.findById(event.orderId);
  expect(order).not.toBeNull();
  expect(order!.status).toEqual(OrderStatus.Complete);
});

it('calls ack on the event', async () => {
  const { listener, event, msg } = await setUp();
  await listener.onMessage(event, msg);
  // Verify that ack() was called on the mock.
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
