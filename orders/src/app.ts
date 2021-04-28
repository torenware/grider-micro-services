import express from 'express';
// Trap exceptions in async handlers:
import 'express-async-errors';
// The following initially shows a TS error, resolvable by installing @types/mongoose:
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

// app routes here
import { createOrderRouter } from './routes/new';
import { fetchOrderRouter } from './routes/show';
import { getOrdersRouter } from './routes';
import { deleteOrderRouter } from './routes/delete';

import {
  errorHandler,
  currentUser,
  NotFoundError,
} from '@grider-courses/common';

const app = express();
// Trust the ingress nginx proxy upstream:
app.set('trust proxy', true);
app.use(json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);

// use routes here
app.use(createOrderRouter);
app.use(getOrdersRouter);
app.use(fetchOrderRouter);
app.use(deleteOrderRouter);

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
