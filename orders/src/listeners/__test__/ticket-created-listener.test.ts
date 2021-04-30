import mongoose from 'mongoose';
import { mocked } from 'ts-jest/utils';
import { Message } from 'node-nats-streaming';
import { TicketCreatedListener } from '../../listeners/ticket-created-listener';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

const setUp = async () => {
  // Create the listener.
  const client = natsWrapper.client;
  const listener = new TicketCreatedListener(client);

  // Create a fake event.
  const id = new mongoose.Types.ObjectId().toHexString();
  const event = {
    id,
    userId: 'i-got-nobody',
    title: 'The Aristocrats',
    price: 33,
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

it('creates a ticket record upon processing a ticket created event', async () => {
  // Verify that a ticket record was created.
  const { listener, event, msg } = await setUp();
  await listener.onMessage(event, msg);
  const ticket = await Ticket.findById(event.id);
  expect(ticket).not.toBeNull();
  expect(ticket!.title).toEqual(event.title);
  expect(ticket!.price).toEqual(event.price);
  // console.log(ticket);
});

it('calls ack on the event', async () => {
  const { listener, event, msg } = await setUp();
  await listener.onMessage(event, msg);
  // Verify that ack() was called on the mock.
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
