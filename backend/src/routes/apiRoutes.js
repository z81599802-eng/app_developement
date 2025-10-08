import { Router } from 'express';
import { getDashboardLink } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboardlinks', authenticate, getDashboardLink);

export default router;
