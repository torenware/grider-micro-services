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
import e from 'express';

// Candidate for an env var:
const EXPIRATION_WINDOW_SECONDS = 60 * 15;

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
      throw new BadRequestError('Ticket was not found.');
    }

    if (await ticket.isReserved()) {
      throw new BadRequestError('Ticket is no longer available');
    }

    // User has 15 minutes to buy...
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it.
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    // Emit order:created.

    // TBD.

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
