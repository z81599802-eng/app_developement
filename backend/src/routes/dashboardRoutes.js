import { Router } from 'express';
import { getDashboardSection, getDashboardStatus } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/status', authenticate, getDashboardStatus);
router.get('/:section', authenticate, getDashboardSection);

export default router;
