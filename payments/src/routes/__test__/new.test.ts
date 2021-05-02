import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/orders';
import { natsWrapper } from '../../nats-wrapper';
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
  const cookie = global.signinCookie();
  await request(app)
    .post('/api/payments')
    .set('Cookie', cookie)
    .send({
      token: 'not-real',
      orderId,
    })
    .expect(404);
});

it('must have a valid orderId that belongs to the user', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const wrongCookie = global.signinCookie();
  const order = Order.build({
    id: orderId,
    userId,
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
    })
    .expect(401);
});

it('fails if the order is in a cancelled state', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signinCookie(userId);
  const order = Order.build({
    id: orderId,
    userId,
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
    })
    .expect(400);
});

it('returns a payment with a code of 201', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const cookie = global.signinCookie(userId);
  const order = Order.build({
    id: orderId,
    userId,
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
      token: 'arbitrary',
    })
    .expect(201);

  expect(response.body.id).not.toBeUndefined();
  console.log(response.body);
});
