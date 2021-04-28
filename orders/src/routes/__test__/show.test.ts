import request from 'supertest';
import { app } from '../../app';

it('does not return a 404', async () => {
  const id = 'temp-will-not-work';
  const response = await request(app).get(`/api/orders/${id}`).send({});
  console.log('Got:', response.status);
  expect(response.status).not.toEqual(404);
});
