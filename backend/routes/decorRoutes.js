import express from 'express';
import {
  getDecorations,
  getDecorationById,
  createDecoration,
  updateDecoration,
  deleteDecoration,
} from '../controllers/decorController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getDecorations)
  .post(protect, admin, createDecoration);

router.route('/:id')
  .get(getDecorationById)
  .put(protect, admin, updateDecoration)
  .delete(protect, admin, deleteDecoration);

export default router;
