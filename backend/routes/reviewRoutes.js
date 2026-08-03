import express from 'express';
import {
  createReview,
  getItemReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.route('/:itemType/:itemId')
  .get(getItemReviews);

router.route('/:id')
  .delete(protect, deleteReview);

export default router;
