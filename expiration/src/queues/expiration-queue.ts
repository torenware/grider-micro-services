import Queue from 'bull';

// Describe what goes in a job.
interface Payload {
  orderId: string;
  opts?: any;
}

const expirationQueue = new Queue<Payload>('order-expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  console.log('Process a job', job.data.orderId);
});

export { expirationQueue };
