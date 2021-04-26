import request from 'supertest';
import { app } from '../../app';
// import { Ticket } from '../../models/ticket';

it('Fails if there is no such ticket', async () => {
  const ticketID = 'random-stuff';
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
  const { id, userId } = ticketResponse.body;
  console.log(ticketResponse.body);
  //console.log(id, userId);

  // Now fetch the ticket
  const response = await request(app)
    .get(`/api/tickets/${id}`)
    .set('Cookie', global.signinCookie())
    .send();

  expect(response.status).toEqual(200);
  expect(response.body.id).toEqual(id);
});
