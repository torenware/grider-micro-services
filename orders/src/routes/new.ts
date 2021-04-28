import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  NotFoundError,
  BadRequestError,
  requireAuth,
  validateRequest,
  OrderStatus,
} from '@grider-courses/common';
import { natsWrapper } from '../nats-wrapper';
import { Ticket } from '../models/ticket';
import { Order } from '../models/orders';

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [body('ticketId').not().isEmpty()],
  validateRequest,

  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Make sure the ticket exists and isn't reserved.
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Ticket is not available, i.e., is not in a cancelled
    // order
    const existingOrder = await Order.findOne({
      ticket,
      status: {
        $in: [
          OrderStatus.Created,
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete,
        ],
      },
    });
    if (existingOrder) {
      throw new BadRequestError('Ticket is no longer available');
    }

    // User has 15 minutes to buy...

    // Build the order and save it.

    // Emit order:created.

    res.status(201).send({});
  }
);

export { router as createOrderRouter };
