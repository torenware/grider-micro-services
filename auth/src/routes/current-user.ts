import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
  // Note the ? which makes TS check iff session exists.
  if (!req.session?.jwt) {
    return res.send({ currentUser: null });
  }

  // apparently logged in, but make sure we are not being hacked.
  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
    return res.send({ currentUser: payload });
  } catch (err) {
    return res.send({ currentUser: null });
  }
});

export { router as currentUserRouter };
