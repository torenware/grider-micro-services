import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  NotFoundError,
  BadRequestError,
  requireAuth,
  validateRequest,
  OrderStatus,
  NotAuthorizedError,
} from '@grider-courses/common';

import { Order } from '../models/orders';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,

  [
    body('token').not().isEmpty().withMessage('Valid stripe token required'),
    body('orderId').not().isEmpty().withMessage('orderId required.'),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled or expired item');
    }

    res.status(201).send({});
  }
);

export { router as createChargeRouter };
