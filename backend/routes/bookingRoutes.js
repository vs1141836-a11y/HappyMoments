import express from 'express';
import {
  createBooking,
  verifyPayment,
  getMyBookings,
  getBookingById,
  checkAvailability,
  downloadInvoice,
  getAllBookingsAdmin,
  updateBookingStatusAdmin,
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Availability check is public (so user can check on calendar prior to logging in)
router.post('/check-availability', checkAvailability);

// Authenticated booking routes
router.post('/', protect, createBooking);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.get('/:id/invoice', protect, downloadInvoice);

// Administrative booking routes
router.get('/admin/all', protect, admin, getAllBookingsAdmin);
router.put('/admin/:id/status', protect, admin, updateBookingStatusAdmin);

export default router;
