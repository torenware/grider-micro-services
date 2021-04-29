import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError } from '@grider-courses/common';
import { natsWrapper } from '../nats-wrapper';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { Ticket } from '../models/ticket';
import { Order } from '../models/orders';

const router = express.Router();

router.delete(
  '/api/orders/:id',
  requireAuth,

  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotFoundError();
    }
    const ticketId = order.ticket.id!;
    await order.deleteOne();

    // Emit order:created.
    const publisher = new OrderCancelledPublisher(natsWrapper.client);

    await publisher.publish({
      id: order.id,
      userId: order.userId,
      ticket: {
        id: ticketId,
      },
    });

    res.status(200).send({});
  }
);

export { router as deleteOrderRouter };
