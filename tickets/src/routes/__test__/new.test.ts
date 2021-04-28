import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening for tests at /api/tickets', async () => {
  const response = await request(app).post('/api/tickets').send({});

  // i.e., something is definitely listening at our path.
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is authenticated', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a non-401 if the user is authenticated', async () => {
  const cookie = global.signinCookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if the title is invalid', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signinCookie())
    .send({})
    .expect(400);
});

it('returns an error if the price is invalid', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signinCookie())
    .send({
      price: -10,
    })
    .expect(400);
});

it('creates a ticket if the inputs are valid', async () => {
  // We should have a clean memory db, so we retrieve existing
  // tickets, but expert there will be none.
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signinCookie())
    .send({
      title: 'Whattashow',
      price: 10,
    });

  expect(response.status).toEqual(201);
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
});

it('emits an event on creating a ticket', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signinCookie())
    .send({
      title: 'Whattashow',
      price: 10,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
