import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['decor', 'rental'],
    required: [true, 'Category type must be decor or rental'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create slug before saving
categorySchema.pre('save', function (next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
