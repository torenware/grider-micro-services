import express, { Request, Response } from 'express';
import { NotFoundError } from '@grider-courses/common';

const router = express.Router();

router.get('/api/orders/:id', async (req: Request, res: Response) => {
  res.send({});
});

export { router as fetchOrderRouter };
