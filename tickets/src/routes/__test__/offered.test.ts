import request from 'supertest';
import { app } from '../../app';

it('requires auth', async () => {
  await request(app).get('/api/tickets/selling').send().expect(401);
});

it('only returns the tickets of the user', async () => {
  const ourUser = global.signinCookie();
  const notOurUser = global.signinCookie();

  const ourTicket = {
    title: 'Our Town',
    price: 10,
  };

  await request(app)
    .post('/api/tickets')
    .set('Cookie', ourUser)
    .send(ourTicket)
    .expect(201);

  const notOurTicket = {
    title: 'Stranger In A Strange Land',
    price: 9,
  };

  await request(app)
    .post('/api/tickets')
    .set('Cookie', notOurUser)
    .send(notOurTicket)
    .expect(201);

  const response = await request(app)
    .get('/api/tickets/selling')
    .set('Cookie', ourUser)
    .send()
    .expect(200);
  expect(response.body.length).toEqual(1);
  expect(response.body[0].title).toEqual('Our Town');
});
