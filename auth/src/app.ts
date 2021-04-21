import express from 'express';
// Trap exceptions in async handlers:
import 'express-async-errors';
// The following initially shows a TS error, resolvable by installing @types/mongoose:
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

export { app };
