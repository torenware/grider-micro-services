import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/orders';
import { Payment } from '../../models/payments';
import { natsWrapper } from '../../nats-wrapper';
import { stripe } from '../../stripe';
import { OrderStatus } from '@grider-courses/common';

it('has a valid route that requires auth', async () => {
  const response = await request(app).post('/api/payments').send({});

  expect(response.status).not.toEqual(404);
  expect(response.status).toEqual(401);
});

it('requires a token and a clientId', async () => {
  const cookie = global.signinCookie();
  const noToken = await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      orderId: 'not-real',
    })
    .expect(400);

  expect(noToken.body.errors[0].field).toEqual('token');

  const noClientId = await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      token: 'not-real',
    })
    .expect(400);

  expect(noClientId.body.errors[0].field).toEqual('orderId');
});

it('fails if the orderId does not exist', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signinCookie();
  await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      token: 'not-real',
      orderId,
      ticketId,
    })
    .expect(404);
});

it('must have a valid orderId that belongs to the user', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const wrongCookie = global.signinCookie();
  const order = Order.build({
    id: orderId,
    userId,
    ticketId,
    status: OrderStatus.Created,
    version: 0,
    price: 22,
  });
  await order.save();

  const notMyOrder = await request(app)
    .post('/api/payments')
    .set('Cookie', wrongCookie)
    .send({
      token: 'not-real',
      orderId,
      ticketId,
    })
    .expect(401);
});

it('fails if the order is in a cancelled state', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signinCookie(userId);
  const order = Order.build({
    id: orderId,
    userId,
    ticketId,
    status: OrderStatus.Cancelled,
    version: 0,
    price: 22,
  });
  await order.save();
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      orderId,
      token: 'arbitrary',
      ticketId,
    })
    .expect(400);
});

it('returns a payment with a code of 201', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signinCookie(userId);
  const order = Order.build({
    id: orderId,
    userId,
    ticketId,
    status: OrderStatus.Created,
    version: 0,
    price: 22,
  });
  await order.save();
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      orderId,
      token: 'tok_visa',
      ticketId,
    })
    .expect(201);

  // Check to see if the stripe mock got appropriately called.
  expect(stripe.charges.create).toBeCalledTimes(1);
  const stripeMock = stripe.charges.create as jest.Mock;
  expect(stripeMock.mock.calls[0][0].amount).toEqual(order.price * 100);
  // Our mock always returs:
  const stripeId = 'stripe-charge-id';
  expect(response.body.id).not.toBeUndefined();
  const payment = await Payment.findById(response.body.id);
  expect(payment).not.toBeNull();
  expect(payment!.orderId).toEqual(orderId);
  expect(payment!.stripeId).toEqual(stripeId);

  // And it emits an event
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  const publishMock = natsWrapper.client.publish as jest.Mock;
  expect(publishMock.mock.calls[0][0]).toEqual('payment:created');
  expect(JSON.parse(publishMock.mock.calls[0][1]).orderId).toEqual(
    payment!.orderId
  );
});
