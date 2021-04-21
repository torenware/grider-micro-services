import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

// And modify Request to allow for currentUser
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Note the ? which makes TS check iff session exists.
  if (!req.session?.jwt) {
    return next();
  }
  try {
    // req does NOT have a currentUser, so we tell TS what to expect.
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    req.currentUser = payload;
    // tslint:disable-next-line: no-empty
  } catch (err) {}
  next();
};
