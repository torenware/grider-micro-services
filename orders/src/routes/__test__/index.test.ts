import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/orders';

const createTicket = async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id,
    serial: 1000,
    title: 'Testing Results',
    price: 42,
  });

  await ticket.save();
  return ticket;
};

const createOrderForUser = async (cookie: string[], ticketId: string) => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId })
    .expect(201);
  const order = await Order.findById(response.body.id);
  return order;
};

it('does not return a 404', async () => {
  const response = await request(app).get('/api/orders').send({});
  console.log('Got:', response.status);
  expect(response.status).not.toEqual(404);
});

it('returns orders belonging to the user', async () => {
  const thisUser = global.signinCookie();
  const ticket1 = await createTicket();
  const ticket2 = await createTicket();
  const order1 = await createOrderForUser(thisUser, ticket1.id);
  const order2 = await createOrderForUser(thisUser, ticket2.id);

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', thisUser)
    .send({})
    .expect(200);

  expect(response.body.length).toEqual(2);

  // Is the ticket populated?
  expect(response.body[0].ticket).toBeInstanceOf(Object);
});

it('does not return orders not from the user', async () => {
  const thisUser = global.signinCookie();
  const otherUser = global.signinCookie();
  const ticket = await createTicket();
  await createOrderForUser(otherUser, ticket.id);

  // The ticket exists
  const otherResponse = await request(app)
    .get('/api/orders')
    .set('Cookie', otherUser)
    .send({})
    .expect(200);

  expect(otherResponse.body.length).toEqual(1);

  // But not for the current user.
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', thisUser)
    .send({})
    .expect(200);

  expect(response.body.length).toEqual(0);
});
