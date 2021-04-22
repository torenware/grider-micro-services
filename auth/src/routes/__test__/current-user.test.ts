import request from 'supertest';
import { app } from '../../app';

it('returns a current user for a logged in user', async () => {
  const cookie = await global.signinCookie();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('returns a null user if not logged in', async () => {
  const response = await request(app).get('/api/users/currentuser').expect(200);

  expect(response.body.currentUser).toEqual(null);
});
