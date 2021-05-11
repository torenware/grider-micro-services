import { Ticket } from '../ticket';

it('implements OCC (optimistic concurrency control)', async () => {
  // Create a ticket and save it.
  const ticket = Ticket.build({
    title: 'Cool Show',
    price: 20,
    userId: 'arbitrary',
  });
  await ticket.save();
  const id = ticket.id;

  // So we can observe changes in version, fetch it twice.
  const fetch1 = await Ticket.findById(id);
  const fetch2 = await Ticket.findById(id);

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
  const ticket = Ticket.build({
    title: 'Cool Show',
    price: 20,
    userId: 'arbitrary',
  });
  await ticket.save();
  const id = ticket.id;
  expect(ticket.version).toEqual(0);

  // We expect vn to go up one on each save
  ticket.set({ price: 25 });
  await ticket.save();
  expect(ticket.version).toEqual(1);
  ticket.set({ price: 30 });
  await ticket.save();
  expect(ticket.version).toEqual(2);
});

it('has a serial field', async () => {
  const ticket = Ticket.build({
    title: 'Mickey has serial',
    price: 80,
    userId: 'somebody',
  });
  await ticket.save();
  expect(ticket.serial).toBeGreaterThan(100);

  // See if we actually increment
  const oldValue = ticket.serial;
  const newTicket = Ticket.build({
    title: 'Mickey has another serial',
    price: 81,
    userId: 'somebody',
  });
  await newTicket.save();
  expect(newTicket.serial! - oldValue!).toEqual(1);
});
