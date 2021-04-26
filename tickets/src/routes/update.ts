import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  validateRequest,
} from '@grider-courses/common';
import { Ticket } from '../models/ticket';

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

    // Now updated the record.
    const record = await Ticket.findById(req.params.id);
    record!.title = req.body.title;
    record!.price = req.body.price;
    await record?.save();

    res.send(record);
  }
);

export { router as updateTicketRouter };
