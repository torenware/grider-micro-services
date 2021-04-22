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

it('fails when a non-existing email is supplied', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'random@email.com',
      password: 'valid-password',
    })
    .expect(400);
});

it('succeeds if the credentials are correct, and gets a valid cookie', async () => {
  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'valid@email.com',
      password: 'valid-password',
    })
    .expect(200);

  const cookie = response.get('Set-Cookie');
  expect(cookie).toBeDefined();

  // See https://attacomsian.com/blog/nodejs-base64-encode-decode
  //const jwtToken = Buffer.from(cookie, 'base64');
});

it('fails if the account exists but the password is wrong', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'valid@email.com',
      password: 'wrong-password',
    })
    .expect(400);
});
