import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@grider-courses/common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title must be supplied'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be valid'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();

    const client = natsWrapper.client;
    const publisher = new TicketCreatedPublisher(client);

    await publisher.publish({
      id: ticket.id,
      version: ticket.version,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
