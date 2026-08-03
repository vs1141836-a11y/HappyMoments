import mongoose from 'mongoose';

const decorationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a decoration package title'],
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
  theme: {
    type: String,
    default: 'Elegant',
  },
  price: {
    type: Number,
    required: [true, 'Please specify the booking price'],
    min: 0,
  },
  includedItems: [{
    type: String,
  }],
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

const Decoration = mongoose.model('Decoration', decorationSchema);
export default Decoration;
