import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the requested id does not exist', async () => {
  const ticketID = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${ticketID}`)
    .set('Cookie', global.signinCookie())
    .send({
      title: 'A different show',
      price: 11,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const ticketID = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${ticketID}`)
    .send({
      title: 'A different show',
      price: 11,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the id in question', async () => {
  // First create a ticket, and pull it back from the model.
  const cookie1 = global.signinCookie();
  const cookie2 = global.signinCookie();

  const newTicket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie1)
    .send({
      title: 'Not Our Record',
      price: 42,
    })
    .expect(201);

  const ticketID = newTicket.body.id;
  // Now try to fetch it with different user
  await request(app)
    .put(`/api/tickets/${ticketID}`)
    .set('Cookie', cookie2)
    .send({
      title: 'Not Our Record Either',
      price: 20,
    })
    .expect(401);
});

it('returns a 400 the user does not specify the title or price', async () => {
  const cookie = global.signinCookie();
  const ticketID = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${ticketID}`)
    .set('Cookie', cookie)
    .send({
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticketID}`)
    .set('Cookie', cookie)
    .send({
      title: 'The Eternal Triangle',
      price: -20,
    })
    .expect(400);
});

it('returns a 200 if authenticated and request is valid', async () => {
  const cookie = global.signinCookie();

  const newTicket = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Truly Our Record',
      price: 11,
    })
    .expect(201);

  const ticketID = newTicket.body.id;
  await request(app)
    .put(`/api/tickets/${ticketID}`)
    .set('Cookie', cookie)
    .send({
      title: 'The Eternal Triangle',
      price: 11.5,
    })
    .expect(200);

  // Did we actually update the ticket?
  const updated = await request(app).get(`/api/tickets/${ticketID}`).send();

  expect(updated.body.title).toEqual('The Eternal Triangle');
  expect(updated.body.price).toEqual(11.5);
});
