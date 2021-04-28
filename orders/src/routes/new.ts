import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@grider-courses/common';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [body('ticketId').not().isEmpty()],
  validateRequest,

  async (req: Request, res: Response) => {
    res.status(201).send({});
  }
);

export { router as createOrderRouter };
