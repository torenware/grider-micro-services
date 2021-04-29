import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('does not return a 404', async () => {
  const id = 'temp-will-not-work';
  const response = await request(app).get(`/api/orders/${id}`).send({});
  console.log('Got:', response.status);
  expect(response.status).not.toEqual(404);
});

it('if logged in, return 404 if no such order id exists', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signinCookie();
  await request(app)
    .get(`/api/orders/${orderId}`)
    .set('Cookie', cookie)
    .send()
    .expect(404);
});

it('if logged in, but the ticket exists but is not our user return 404', async () => {
  const ourCookie = global.signinCookie();
  const theirCookie = global.signinCookie();
  const ticket = Ticket.build({
    title: 'Already Gone',
    price: 13,
  });
  await ticket.save();
  const ticketId = ticket.id;

  // Create order under the other user.
  const theirResponse = await request(app)
    .post('/api/orders')
    .set('Cookie', theirCookie)
    .send({
      ticketId,
    })
    .expect(201);

  const orderId = theirResponse.body.id;

  await request(app)
    .get(`/api/orders/${orderId}`)
    .set('Cookie', ourCookie)
    .send()
    .expect(404);
});

it('if the order exists, return it with a 200', async () => {
  const cookie = global.signinCookie();
  const ticket = Ticket.build({
    title: 'Our Show',
    price: 13,
  });
  await ticket.save();
  const ticketId = ticket.id;

  // Create our order
  const orderResponse = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      ticketId,
    })
    .expect(201);

  console.log('Show order as created');
  console.log(orderResponse.body);

  // And fetch it back.
  const fetchResponse = await request(app)
    .get(`/api/orders/${orderResponse.body.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  console.log('As retrieved from show');
  console.log(fetchResponse.body);

  expect(fetchResponse.body.ticket).toBeInstanceOf(Object);
});
