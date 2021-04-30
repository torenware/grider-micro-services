import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
  validateRequest,
} from '@grider-courses/common';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title must be supplied'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be valid'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    if (ticket.isLocked()) {
      throw new BadRequestError('Record is currently reserved and locked');
    }

    // Now updated the record.
    const record = await Ticket.findById(req.params.id);
    const { title, price } = req.body;
    record!.set({
      title,
      price,
    });
    await record?.save();

    // Send off our event.
    const client = natsWrapper.client;
    const publisher = new TicketUpdatedPublisher(client);

    await publisher.publish({
      id: ticket.id,
      version: ticket.version,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
    });

    res.send(record);
  }
);

export { router as updateTicketRouter };
