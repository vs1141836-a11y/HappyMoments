import express from 'express';
import {
  getRentals,
  getRentalById,
  createRental,
  updateRental,
  deleteRental,
} from '../controllers/rentalController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getRentals)
  .post(protect, admin, createRental);

router.route('/:id')
  .get(getRentalById)
  .put(protect, admin, updateRental)
  .delete(protect, admin, deleteRental);

export default router;
