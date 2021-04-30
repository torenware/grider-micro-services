import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@grider-courses/common';
import { OrderCreatedListener } from '../../listeners/order-created-listener';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

const setUp = async () => {
  // Create the listener.
  const client = natsWrapper.client;
  const listener = new OrderCreatedListener(client);

  // Create a fake event.
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'The Fizz Buzzers',
    price: 50,
    userId: 'not-anonymous-today',
  });
  await ticket.save();

  const event: OrderCreatedEvent['data'] = {
    id,
    userId: 'i-got-nobody',
    version: 0,
    status: OrderStatus.Created,
    expiresAt: new Date().toUTCString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
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
  return { listener, event, msg, ticket };
};

it('causes an event to be reserved', async () => {
  const { listener, event, msg, ticket } = await setUp();
  expect(ticket.isLocked()).toBeFalsy();
  await listener.onMessage(event, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.isLocked()).toBeTruthy();

  // The message is acked
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
