import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['Decoration', 'DecorationRental'],
    required: true,
  },
  decorItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Decoration',
  },
  rentalItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DecorationRental',
  },
  eventDate: {
    type: String, // Stored as YYYY-MM-DD for simple consistency
    required: [true, 'Please select an event date'],
  },
  eventTime: {
    type: String, // e.g., '10:00 AM - 2:00 PM', '4:00 PM - 9:00 PM'
    required: [true, 'Please select a time slot'],
  },
  eventLocation: {
    type: String,
    required: [true, 'Please provide the event address'],
  },
  color: {
    type: String, // Only applicable for rentals
  },
  size: {
    type: String,  // Only applicable for rentals
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
