import { Router } from 'express';
import {
  addDashboardLink,
  createUserAccount,
  loginAdmin,
  searchUsers,
  signupAdmin
} from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', signupAdmin);
router.post('/login', loginAdmin);
router.post('/createuser', verifyAdmin, createUserAccount);
router.get('/usersearch', verifyAdmin, searchUsers);
router.post('/dashboardlinks', verifyAdmin, addDashboardLink);

export default router;
