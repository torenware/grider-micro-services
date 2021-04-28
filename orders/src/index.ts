import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

// Set up our start up of mongo via mongoose
const start = async () => {
  // Do a quick check that essential env variables are in fact
  // available to us:
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env variable must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI env var must be defined.');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL env must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_URL env must be defined');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Mongo started');

    await natsWrapper.connect(
      'ticketing',
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    console.log('NATS client is up.');

    // Make sure we exit clean.  We put this here so it's top level and
    // easy to find (which it would not be buried in an include or library).
    const client = natsWrapper.client;
    client.on('close', () => {
      console.log('NATS connection going down.');
      process.exit();
    });

    // Register our process handlers so when the container goes away, we
    // close down NATS.
    process.on('SIGTERM', () => client.close());
    process.on('SIGINT', () => client.close());
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log('Listening on port 3000!!!!!!!!');
  });
};

start();
