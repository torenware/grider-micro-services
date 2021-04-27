import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();
// "stan" is nats spelled backwards, and is their cute name for their client.
// The ID is the second argument, and needs to be unique for each
// client.
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('Closing connection to NATSSS');
    process.exit();
  });

  const listener = new TicketCreatedListener(stan);
  listener.listen();
});

process.on('SIGTERM', () => stan.close());
process.on('SIGINT', () => stan.close());

// Catch signals to make sure we close up gracefully
