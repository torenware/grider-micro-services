import express from 'express';

import { currentUser } from '../middlewares/current-user';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  // Out middleware has already set up the currentUser
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
