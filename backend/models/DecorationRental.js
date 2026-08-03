import mongoose from 'mongoose';

const decorationRentalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a rental item title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please associate a category'],
  },
  rentalPrice: {
    type: Number,
    required: [true, 'Please specify the rental price per day'],
    min: 0,
  },
  availableColors: [{
    type: String,
  }],
  availableSizes: [{
    type: String,
  }],
  quantityAvailable: {
    type: Number,
    required: [true, 'Please specify the available quantity'],
    default: 1,
    min: 0,
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
  },
  images: [{
    type: String, // URLs to Cloudinary or HD unsplash/pexels
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DecorationRental = mongoose.model('DecorationRental', decorationRentalSchema);
export default DecorationRental;
