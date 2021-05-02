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
import { OrderCreatedPublisher } from '../publishers/order-created-publisher';
// Candidate for an env var:
const EXPIRATION_WINDOW_SECONDS = 60;

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [body('ticketId').not().isEmpty().withMessage('ticketId must be supplied')],
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
    const publisher = new OrderCreatedPublisher(natsWrapper.client);

    await publisher.publish({
      id: order.id,
      version: order.version,
      userId: order.userId,
      expiresAt: order.expiresAt.toUTCString(),
      status: order.status,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
