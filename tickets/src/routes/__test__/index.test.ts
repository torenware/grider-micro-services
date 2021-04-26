import request from 'supertest';
import { app } from '../../app';

it('returns all tickets if authorized', async () => {
  const items = [
    {
      title: 'First Blood',
      price: 4.99,
    },
    {
      title: 'Second Life',
      price: 15,
    },
    {
      title: 'Third Bird',
      price: 20,
    },
  ];
  // Create our tickets

  const cookie = global.signinCookie();
  const returned = new Map();
  for (const item of items) {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send(item)
      .expect(201);

    returned.set(item.title, response.body);
  }
  // Get back our items, hopefully.
  const fromAPI = await request(app).get('/api/tickets').send().expect(200);
  expect(fromAPI.body.length).toEqual(3);
});
