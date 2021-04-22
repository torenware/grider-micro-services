import request from 'supertest';
import { app } from '../../app';

beforeEach(async () => {
  // Make sure we have a valid account configured.
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'valid@email.com',
      password: 'valid-password',
    })
    .expect(201);
});

it('removes the cookie when the user is signed out', async () => {
  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'valid@email.com',
      password: 'valid-password',
    })
    .expect(200);

  // We have a cookie.
  const cookie = response.get('Set-Cookie');
  expect(cookie).toBeDefined();

  // Log out, checking the cookie.
  const resp2 = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  // We get back a generic no-cookie-cookie string, which
  // I use below.
  expect(resp2.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
