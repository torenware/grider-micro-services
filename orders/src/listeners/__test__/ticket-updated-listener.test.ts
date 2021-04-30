import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedEvent } from '@grider-courses/common';

const setUp = async () => {
  // Create the listener.
  const client = natsWrapper.client;
  const listener = new TicketUpdatedListener(client);

  // Create a fake event.
  const id = new mongoose.Types.ObjectId().toHexString();
  const event: TicketUpdatedEvent['data'] = {
    id,
    userId: 'i-got-nobody',
    title: 'The Aristocrats',
    price: 33,
    version: 0,
  };

  // Seed the db with an existing ticket.
  const ticket = Ticket.build(event);
  await ticket.save();

  // Let's update the event.
  event.price = 40;
  event.version = ticket.version + 1;
  event.title = 'The Aristocrats II';

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

it('updates a ticket record upon processing a ticket updated event', async () => {
  // Verify that a ticket record was created.
  const { listener, event, msg, ticket } = await setUp();
  await listener.onMessage(event, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(event.title);
  expect(updatedTicket!.price).toEqual(event.price);
  expect(updatedTicket!.version).toEqual(ticket.version + 1);
});

it('calls ack on the event', async () => {
  const { listener, event, msg, ticket } = await setUp();
  await listener.onMessage(event, msg);
  // Verify that ack() was called on the mock.
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it('fails on out-of-order version', async () => {
  const { listener, event, msg, ticket } = await setUp();
  event.version += 1; // version should be too high.
  let e = null;
  try {
    await listener.onMessage(event, msg);
  } catch (err) {
    e = err;
  }
  expect(e).not.toBeNull();
  expect(e.toString()).toContain('Ticket not found');

  // And it will not be acked:
  expect(msg.ack).not.toBeCalled();
});
