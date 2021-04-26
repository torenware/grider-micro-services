import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@grider-courses/common';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({});
  if (!tickets) {
    throw new NotFoundError();
  } else {
    res.send(tickets);
  }
});

export { router as getTicketsRouter };
