import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  NotFoundError,
  BadRequestError,
  requireAuth,
  validateRequest,
  OrderStatus,
  NotAuthorizedError,
  PaymentCreatedEvent,
} from '@grider-courses/common';
import { stripe } from '../stripe';

import { Order } from '../models/orders';
import { Payment } from '../models/payments';
import { PaymentCreatedPublisher } from '../publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,

  [
    body('token').not().isEmpty().withMessage('Valid stripe token required'),
    body('orderId').not().isEmpty().withMessage('orderId required.'),
    body('ticketId').not().isEmpty().withMessage('ticketId required'),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled or expired item');
    }

    // @see https://stripe.com/docs/api/charges
    const charge = await stripe.charges.create({
      // amount is given in cents.
      amount: order.price * 100,
      currency: 'usd',
      // description of charge for buyer.
      description: 'Your ticket',
      source: token,
    });

    // Create our payment record.
    const payment = Payment.build({
      orderId: order.id,
      stripeId: charge.id,
      version: 0,
    });

    await payment.save();

    // And we tell the world about it.
    const event: PaymentCreatedEvent['data'] = {
      id: payment!.id,
      orderId: payment!.orderId,
      ticketId: order.ticketId,
      stripeId: payment!.stripeId,
      version: payment!.version,
    };
    new PaymentCreatedPublisher(natsWrapper.client).publish(event);

    res.status(201).send(payment);
  }
);

export { router as createChargeRouter };
