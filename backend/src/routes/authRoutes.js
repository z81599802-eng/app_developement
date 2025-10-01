import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  login,
  profile,
  requestPasswordReset,
  signup
} from '../controllers/authController.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', authenticate, profile);
router.post('/reset-password-request', requestPasswordReset);

export default router;
