import express from 'express';
// Trap exceptions in async handlers:
import 'express-async-errors';
// The following initially shows a TS error, resolvable by installing @types/mongoose:
import mongoose from 'mongoose';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

import { errorHandler } from './middlewares/error-handlers';
import { NotFoundError } from './errors/not-found-error';

const app = express();
// Trust the ingress nginx proxy upstream:
app.set('trust proxy', true);
app.use(json());

app.use(
  cookieSession({
    signed: false,
    // when I have TLS working:
    secure: true,
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// Universal route to deal with 404s. Note this needs to be *before* the
// call to errorHandler.
app.all('*', async (req, res, next) => {
  // synchronous response:
  // throw new NotFoundError();

  // async response
  // next(new NotFoundError());

  // Or you can use the package express-async-errors:
  throw new NotFoundError();
});

app.use(errorHandler);

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
