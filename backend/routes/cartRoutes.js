import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All cart routes require user login

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/clear')
  .post(clearCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;
