import { Router } from 'express';
import { getProfile } from '../controllers/profileController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/profile', authenticate, getProfile);

export default router;
