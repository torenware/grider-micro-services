import express, { Request, Response } from 'express';
import { NotFoundError, requireAuth } from '@grider-courses/common';
import { Order } from '../models/orders';

const router = express.Router();

router.get(
  '/api/orders/:id',
  requireAuth,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const order = await Order.findById(id).populate('ticket');
    if (!order) {
      throw new NotFoundError();
    }
    // But is it our order?
    const userId = order.userId;
    if (req.currentUser!.id !== userId) {
      throw new NotFoundError();
    }
    res.send(order);
  }
);

export { router as fetchOrderRouter };
