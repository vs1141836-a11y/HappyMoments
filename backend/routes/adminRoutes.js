import express from 'express';
import {
  getDashboardStats,
  getAllUsersAdmin,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsersAdmin);

export default router;
