import express from 'express';

import { currentUser } from '@grider-courses/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  // Out middleware has already set up the currentUser
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
