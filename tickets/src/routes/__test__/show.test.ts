import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

// import { Ticket } from '../../models/ticket';

it('Fails if there is no such ticket', async () => {
  // Make sure we use a valid looking ID, since
  // mongo and mongoose get annoyed if we choose
  // something invalid.
  const ticketID = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/tickets/${ticketID}`)
    .set('Cookie', global.signinCookie())
    .expect(404);
});

it('succeeds if the ticket exists', async () => {
  const title = 'Show That Never Ends';
  const price = 20;

  const ticketResponse = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signinCookie())
    .send({
      title,
      price,
    });
  expect(ticketResponse.status).toEqual(201);
  const { id } = ticketResponse.body;

  // Now fetch the ticket
  const response = await request(app)
    .get(`/api/tickets/${id}`)
    .set('Cookie', global.signinCookie())
    .send();

  expect(response.status).toEqual(200);
  expect(response.body.id).toEqual(id);
});
