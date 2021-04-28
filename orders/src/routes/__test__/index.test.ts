import request from 'supertest';
import { app } from '../../app';

it('does not return a 404', async () => {
  const response = await request(app).get('/api/orders').send({});
  console.log('Got:', response.status);
  expect(response.status).not.toEqual(404);
});
