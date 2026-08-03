import mongoose from 'mongoose';

const bookingItemSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  color: String,
  size: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [bookingItemSchema],
  eventDate: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  eventTime: {
    type: String,
    required: true,
  },
  eventLocation: {
    type: String,
    required: true,
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingFee: {
    type: Number,
    required: true,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'failed', 'refunded'],
    default: 'unpaid',
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  trackingTimeline: {
    type: [timelineEventSchema],
    default: [
      {
        status: 'pending',
        title: 'Booking Placed',
        description: 'Your booking has been registered and is awaiting payment verification.',
      },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
