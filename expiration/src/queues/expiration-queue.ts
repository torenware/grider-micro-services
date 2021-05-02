import Queue from 'bull';
import { ExpirationCompletePublisher } from '../publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

// Describe what goes in a job.
interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>('order-expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  // console.log('Process a job', job.data.orderId);
  // Emit our event
  console.log(`Expiring order ${job.data.orderId}`);
  const event = {
    orderId: job.data.orderId,
  };

  await new ExpirationCompletePublisher(natsWrapper.client).publish(event);
});

export { expirationQueue };
