import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('does not return a 404', async () => {
  const response = await request(app).post('/api/orders').send({});
  console.log('Got:', response.status);
  expect(response.status).not.toEqual(404);
});

it('returns an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();
  const cookie = global.signinCookie();
  await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      ticketId,
    })
    .expect(400);
});

it('returns an error if the ticket is reserved', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    id,
    title: 'Last Detail',
    price: 10,
  });
  await ticket.save();
  const ticketId = ticket.id!;

  // Now create an order. First time it should work.
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCookie())
    .send({
      ticketId,
    })
    .expect(201);

  // Now try again. We should fail.
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCookie())
    .send({
      ticketId,
    })
    .expect(400);
});

it('returns an order if input is valid', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id,
    title: 'Last Detail',
    price: 10,
  });
  await ticket.save();
  const ticketId = ticket.id!;

  // Now create an order. First time it should work.
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCookie())
    .send({
      ticketId,
    })
    .expect(201);
});

it('emits an event on creating a ticket', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id,
    title: 'Whattashow',
    price: 10,
  });
  ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signinCookie())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
