import express from 'express';
// Trap exceptions in async handlers:
import 'express-async-errors';
import { json } from 'body-parser';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

import { errorHandler } from './middlewares/error-handlers';
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.use(json());

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);


// Universal route to deal with 404s. Note this needs to be *before* the
// call to errorHandler.
app.all('*', async (req, res, next) => {
  //synchronous response:
  // throw new NotFoundError();

  //async response
  //next(new NotFoundError());

  //Or you can use the package express-async-errors:
  throw new NotFoundError();
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log('Listening on port 3000!!!!!!!!');
});
