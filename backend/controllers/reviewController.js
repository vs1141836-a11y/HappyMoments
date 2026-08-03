import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { itemType, itemId, rating, comment } = req.body;

    if (!rating || !comment || !itemType || !itemId) {
      return res.status(400).json({ success: false, message: 'Please provide rating, comment, and target item details' });
    }

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      
      // Check if already reviewed
      const exists = mockDb.reviews.find(r => 
        r.user._id === req.user._id && 
        r.itemType === itemType && 
        (itemType === 'Decoration' ? r.decorItem === itemId : r.rentalItem === itemId)
      );

      if (exists) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this item' });
      }

      // Check if user had a completed booking
      const hadBooking = mockDb.bookings.some(b => 
        b.user === req.user._id && 
        b.paymentStatus === 'paid' && 
        b.items.some(bi => bi.itemType === itemType && (itemType === 'Decoration' ? bi.decorItem === itemId : bi.rentalItem === itemId))
      );

      const review = {
        _id: `rev_${Date.now()}`,
        user: { _id: req.user._id, name: req.user.name },
        itemType,
        rating: Number(rating),
        comment,
        isVerifiedBuyer: hadBooking,
        createdAt: new Date(),
      };

      if (itemType === 'Decoration') {
        review.decorItem = itemId;
        // Update decor rating in memory
        const itemIdx = mockDb.decorations.findIndex(d => d._id === itemId);
        if (itemIdx !== -1) {
          const itemReviews = mockDb.reviews.filter(r => r.decorItem === itemId).concat(review);
          const totalRating = itemReviews.reduce((sum, r) => sum + r.rating, 0);
          mockDb.decorations[itemIdx].averageRating = Math.round((totalRating / itemReviews.length) * 10) / 10;
          mockDb.decorations[itemIdx].numReviews = itemReviews.length;
        }
      } else {
        review.rentalItem = itemId;
        // Update rental rating in memory
        const itemIdx = mockDb.rentals.findIndex(r => r._id === itemId);
        if (itemIdx !== -1) {
          const itemReviews = mockDb.reviews.filter(r => r.rentalItem === itemId).concat(review);
          const totalRating = itemReviews.reduce((sum, r) => sum + r.rating, 0);
          mockDb.rentals[itemIdx].averageRating = Math.round((totalRating / itemReviews.length) * 10) / 10;
          mockDb.rentals[itemIdx].numReviews = itemReviews.length;
        }
      }

      mockDb.reviews.push(review);

      return res.status(201).json({
        success: true,
        review,
      });
    }

    // Check if user has already reviewed this item
    const query = {
      user: req.user._id,
      itemType,
    };
    if (itemType === 'Decoration') {
      query.decorItem = itemId;
    } else {
      query.rentalItem = itemId;
    }

    const reviewExists = await Review.findOne(query);
    if (reviewExists) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this item' });
    }

    const hadBooking = await Booking.findOne({
      user: req.user._id,
      paymentStatus: 'paid',
      items: {
        $elemMatch: {
          itemType,
          ...(itemType === 'Decoration' ? { decorItem: itemId } : { rentalItem: itemId }),
        },
      },
    });
    
    const reviewData = {
      user: req.user._id,
      itemType,
      rating: Number(rating),
      comment,
      isVerifiedBuyer: !!hadBooking,
    };

    if (itemType === 'Decoration') {
      reviewData.decorItem = itemId;
    } else {
      reviewData.rentalItem = itemId;
    }

    const review = await Review.create(reviewData);
    const populated = await Review.findById(review._id).populate('user', 'name');

    res.status(201).json({
      success: true,
      review: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a decoration package or rental prop
// @route   GET /api/reviews/:itemType/:itemId
// @access  Public
export const getItemReviews = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.params;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const filtered = mockDb.reviews
        .filter(r => 
          r.itemType === itemType && 
          (itemType === 'Decoration' ? r.decorItem === itemId : r.rentalItem === itemId)
        )
        .sort((a,b) => b.createdAt - a.createdAt);

      return res.json({
        success: true,
        count: filtered.length,
        reviews: filtered,
      });
    }

    const query = { itemType };
    if (itemType === 'Decoration') {
      query.decorItem = itemId;
    } else {
      query.rentalItem = itemId;
    }

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const idx = mockDb.reviews.findIndex(r => r._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      const review = mockDb.reviews[idx];
      const authorId = typeof review.user === 'object' ? review.user._id : review.user;

      if (authorId !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
      }

      mockDb.reviews.splice(idx, 1);
      return res.json({
        success: true,
        message: 'Review deleted successfully',
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
