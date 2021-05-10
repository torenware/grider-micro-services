import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { NotFoundError, requireAuth } from '@grider-courses/common';

const router = express.Router();

router.get(
  '/api/tickets/selling',
  requireAuth,
  async (req: Request, res: Response) => {
    const tickets = await Ticket.find({
      userId: req.currentUser!.id,
    });
    res.send(tickets);
  }
);

export { router as offeredTicketsRouter };
