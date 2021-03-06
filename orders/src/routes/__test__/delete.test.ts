import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/orders';
import { natsWrapper } from '../../nats-wrapper';
import { OrderStatus } from '@grider-courses/common';

it('does not return a 404', async () => {
  const id = 'temp-will-not-work';
  const response = await request(app).delete(`/api/orders/${id}`).send({});
  console.log('Got:', response.status);
  expect(response.status).not.toEqual(404);
});

it('will return 404 if it does not exist.', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signinCookie();
  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', cookie)
    .send()
    .expect(404);
});

it('will return 404 if the record does not belong to the user', async () => {
  const ourCookie = global.signinCookie();
  const theirCookie = global.signinCookie();
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id,
    serial: 1000,
    title: 'Not ours',
    price: 11,
  });
  await ticket.save();
  const theirReponse = await request(app)
    .post('/api/orders')
    .set('Cookie', theirCookie)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
  const orderId = theirReponse.body.id;
  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', ourCookie)
    .send()
    .expect(404);
});

it('will delete a record if the user owns it and return 200', async () => {
  const cookie = global.signinCookie();
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id,
    title: 'Ours this time',
    price: 11,
    serial: 1000,
  });
  await ticket.save();
  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const orderId = order.body.id;

  // Try to delete it.
  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  // But is it really gone?
  const recovery = await Order.findById(orderId);
  // we do not actually delete the record.
  expect(recovery).not.toBeNull();
  if (recovery) {
    expect(recovery.status).toEqual(OrderStatus.Cancelled);
  }
});

it('emits an event on deleting a ticket', async () => {
  const cookie = global.signinCookie();
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id,
    title: 'Whattashow',
    price: 10,
    serial: 1000,
  });
  ticket.save();

  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const orderId = order.body.id;

  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  // We expect publish will be called twice, once for the
  // create, once for the delete.
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);

  // Get typescript to recognize our mock so we can test it.
  // See: https://klzns.github.io/how-to-use-type-script-and-jest-mocks
  const publishMock = natsWrapper.client.publish as jest.Mock;
  expect(publishMock.mock.calls[1][0]).toEqual('order:cancelled');
});
