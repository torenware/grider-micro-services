import mongoose from 'mongoose';
import { app } from './app';

// Set up our start up of mongo via mongoose
const start = async () => {
  console.log('starting auth service...');
  // Do a quick check that essential env variables are in fact
  // available to us:
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env variable must be defined');
  }
  if (!process.env.AUTH_URI) {
    throw new Error('AUTH_URI env var must be defined.');
  }

  try {
    await mongoose.connect(process.env.AUTH_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Mongo started');
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log('Listening on port 3000!!!!!!!!');
  });
};

start();
