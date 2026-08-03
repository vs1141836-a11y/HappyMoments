import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update average rating and numReviews on Decoration or DecorationRental after saving
const updateItemRating = async function (itemId, itemModel) {
  const stats = await mongoose.model('Review').aggregate([
    {
      $match: {
        $or: [
          { decorItem: new mongoose.Types.ObjectId(itemId) },
          { rentalItem: new mongoose.Types.ObjectId(itemId) },
        ],
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model(itemModel).findByIdAndUpdate(itemId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        numReviews: stats[0].numReviews,
      });
    } else {
      await mongoose.model(itemModel).findByIdAndUpdate(itemId, {
        averageRating: 0,
        numReviews: 0,
      });
    }
  } catch (err) {
    console.error('Error updating ratings on item:', err);
  }
};

reviewSchema.post('save', async function () {
  if (this.itemType === 'Decoration' && this.decorItem) {
    await updateItemRating(this.decorItem, 'Decoration');
  } else if (this.itemType === 'DecorationRental' && this.rentalItem) {
    await updateItemRating(this.rentalItem, 'DecorationRental');
  }
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    if (doc.itemType === 'Decoration' && doc.decorItem) {
      await updateItemRating(doc.decorItem, 'Decoration');
    } else if (doc.itemType === 'DecorationRental' && doc.rentalItem) {
      await updateItemRating(doc.rentalItem, 'DecorationRental');
    }
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
