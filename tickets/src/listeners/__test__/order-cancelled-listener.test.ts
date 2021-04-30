import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@grider-courses/common';
import { OrderCancelledListener } from '../../listeners/order-cancelled-listener';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

const setUp = async () => {
  // Create the listener.
  const client = natsWrapper.client;
  const listener = new OrderCancelledListener(client);

  // Create a fake event.
  const id = new mongoose.Types.ObjectId().toHexString();
  const orderId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: 'The Fizz Buzzers',
    price: 50,
    userId: 'not-anonymous-today',
    orderId,
  });
  await ticket.save();

  const event: OrderCancelledEvent['data'] = {
    id,
    userId: 'i-got-nobody',
    version: 0,
    ticket: {
      id: ticket.id,
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
  expect(ticket.isLocked()).toBeTruthy();
  await listener.onMessage(event, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.isLocked()).toBeFalsy();

  // The message is acked
  expect(msg.ack).toHaveBeenCalledTimes(1);

  // It emitted an event.
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
