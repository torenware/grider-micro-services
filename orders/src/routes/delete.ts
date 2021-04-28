import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@grider-courses/common';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/api/orders',
  requireAuth,

  async (req: Request, res: Response) => {
    res.status(200).send({});
  }
);

export { router as deleteOrderRouter };
