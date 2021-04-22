import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on a successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com',
      password: 'valid-password',
    })
    .expect(201);
});

it('returns a 400 if email supplied is invalid', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'notvalid!email.com',
      password: 'valid-password',
    })
    .expect(400);
});

it('returns a 400 if no password supplied', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com',
      password: '',
    })
    .expect(400);
});

it('returns a 400 if password is too short', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com',
      password: 'not',
    })
    .expect(400);
});

it('will not allow two signups on the same email', async () => {
  const email = 'valid@email.com';

  // Create an account
  await request(app).post('/api/users/signup').send({
    email,
    password: 'valid-password',
  });

  return request(app)
    .post('/api/users/signup')
    .send({
      email,
      password: 'valid-password',
    })
    .expect(400);
});

it('we create an account a cookie gets set on response', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com',
      password: 'valid-password',
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
