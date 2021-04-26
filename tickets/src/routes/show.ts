import express, { Request, Response } from 'express';
import { NotFoundError } from '@grider-courses/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

// We do not require auth for the get.
router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new NotFoundError();
  } else {
    res.send(ticket);
  }
});

export { router as fetchTicketRouter };
