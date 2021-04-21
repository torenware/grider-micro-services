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
