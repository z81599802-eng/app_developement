import { Router } from 'express';
import { login, profile, signup } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Route for registering a new user account.
router.post('/signup', signup);

// Route for logging in and retrieving a JWT.
router.post('/login', login);

// Protected route that returns the authenticated user's profile.
router.get('/profile', authenticate, profile);

export default router;
