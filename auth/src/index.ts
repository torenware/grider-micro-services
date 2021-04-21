import mongoose from 'mongoose';
import { app } from './app';

// Set up our start up of mongo via mongoose
const start = async () => {
  // Do a quick check that essential env variables are in fact
  // available to us:
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY env variable must be defined');
  }
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
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
