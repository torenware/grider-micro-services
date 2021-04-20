import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middlewares/validate-request';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Don't sign up a user twice.
      throw new BadRequestError('Email already in use');
    }

    const user = User.build({ email, password });
    await user.save();

    // Build the token, which we will deliver as a cookie
    // since we are doing server side rendering and will not have
    // the needed js machinery to create an Authentication header.
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      // The ! indicates that TS should allow this.
      process.env.JWT_KEY!
    );

    // And put it on as a cookie
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
