import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

// "stan" is nats spelled backwards, and is their cute name for their client.
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

// No async/await here. Old timey events.
stan.on('connect', () => {
  console.log('Publisher connected to NATS');

  const data = {
    id: '123',
    title: 'THE STONES',
    price: 50,
  };

  const publisher = new TicketCreatedPublisher(stan);

  // and publish it to the server, labeling it with our topic. The callback is optional.
  publisher.publish(data);
});
