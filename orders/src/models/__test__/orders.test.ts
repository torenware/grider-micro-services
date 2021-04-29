import mongoose from 'mongoose';
import { Order } from '../orders';
import { Ticket } from '../ticket';
import { OrderStatus } from '@grider-courses/common';

it('implements OCC (optimistic concurrency control)', async () => {
  // Create a Order and save it.
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'Cool Show',
    price: 20,
  });
  ticket.save();

  const order = Order.build({
    userId: 'some-id',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  const id = order.id;

  // So we can observe changes in version, fetch it twice.
  const fetch1 = await Order.findById(id);
  const fetch2 = await Order.findById(id);

  console.log(fetch1);
  expect(fetch1!.version).toEqual(fetch2!.version);

  // Change each fetched ticket.
  fetch1!.set({ price: 25 });
  fetch2!.set({ price: 30 });

  // Save one.
  await fetch1!.save();
  expect(fetch1!.version).toEqual(1);

  // And expect the other fetch to fail on save
  let e = null;
  try {
    await fetch2!.save();
  } catch (err) {
    e = err;
  }
  expect(e).not.toBeNull();
  expect(e!.toString()).toContain('VersionError');
});

it('increments the version number on save.', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'Cool Show',
    price: 20,
  });
  ticket.save();

  const order = Order.build({
    userId: 'some-id',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  const id = order.id;
  expect(order.version).toEqual(0);

  // We expect vn to go up one on each save
  order.set({ price: 25 });
  await order.save();
  expect(order.version).toEqual(1);
  order.set({ price: 30 });
  await order.save();
  expect(order.version).toEqual(2);
});
