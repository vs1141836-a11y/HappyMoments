import mongoose from 'mongoose';
import DecorationRental from '../models/DecorationRental.js';
import Category from '../models/Category.js';

// @desc    Get all rental items (with search, category, color, size, and availability filters)
// @route   GET /api/rentals
// @access  Public
export const getRentals = async (req, res, next) => {
  try {
    const { search, category, color, size, minPrice, maxPrice, sort } = req.query;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      let rents = mockDb.rentals.map(r => ({
        ...r,
        category: mockDb.categories.find(c => c._id === r.category)
      }));

      // Search filter
      if (search) {
        const s = search.toLowerCase();
        rents = rents.filter(
          r => r.title.toLowerCase().includes(s) || 
               r.description.toLowerCase().includes(s)
        );
      }

      // Category filter
      if (category) {
        const cat = mockDb.categories.find(c => c.slug === category || c._id === category);
        if (cat) {
          rents = rents.filter(r => r.category && r.category._id === cat._id);
        }
      }

      // Color filter
      if (color) {
        rents = rents.filter(r => 
          r.availableColors.some(c => c.toLowerCase().includes(color.toLowerCase()))
        );
      }

      // Size filter
      if (size) {
        rents = rents.filter(r => 
          r.availableSizes.some(s => s.toLowerCase().includes(size.toLowerCase()))
        );
      }

      // Price filter
      if (minPrice) {
        rents = rents.filter(r => r.rentalPrice >= Number(minPrice));
      }
      if (maxPrice) {
        rents = rents.filter(r => r.rentalPrice <= Number(maxPrice));
      }

      // Sorting
      if (sort === 'priceAsc') {
        rents.sort((a,b) => a.rentalPrice - b.rentalPrice);
      } else if (sort === 'priceDesc') {
        rents.sort((a,b) => b.rentalPrice - a.rentalPrice);
      } else if (sort === 'rating') {
        rents.sort((a,b) => b.averageRating - a.averageRating);
      } else {
        rents.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }

      return res.json({
        success: true,
        count: rents.length,
        rentals: rents,
      });
    }

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      let cat = await Category.findOne({ slug: category });
      if (!cat && mongoose.isValidObjectId(category)) {
        cat = await Category.findById(category);
      }
      if (cat) {
        query.category = cat._id;
      }
    }

    // Color filter
    if (color) {
      query.availableColors = { $regex: color, $options: 'i' };
    }

    // Size filter
    if (size) {
      query.availableSizes = { $regex: size, $options: 'i' };
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.rentalPrice = {};
      if (minPrice) query.rentalPrice.$gte = Number(minPrice);
      if (maxPrice) query.rentalPrice.$lte = Number(maxPrice);
    }

    let apiQuery = DecorationRental.find(query).populate('category');

    // Sorting
    if (sort) {
      if (sort === 'priceAsc') apiQuery = apiQuery.sort('rentalPrice');
      else if (sort === 'priceDesc') apiQuery = apiQuery.sort('-rentalPrice');
      else if (sort === 'rating') apiQuery = apiQuery.sort('-averageRating');
      else apiQuery = apiQuery.sort('-createdAt');
    } else {
      apiQuery = apiQuery.sort('-createdAt');
    }

    const rentals = await apiQuery;

    res.json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single rental item by ID
// @route   GET /api/rentals/:id
// @access  Public
export const getRentalById = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const rental = mockDb.rentals.find(r => r._id === req.params.id);
      if (!rental) {
        return res.status(404).json({ success: false, message: 'Rental item not found' });
      }

      const populated = {
        ...rental,
        category: mockDb.categories.find(c => c._id === rental.category)
      };

      const related = mockDb.rentals
        .filter(r => r.category === rental.category && r._id !== rental._id)
        .slice(0, 4)
        .map(r => ({
          ...r,
          category: mockDb.categories.find(c => c._id === r.category)
        }));

      return res.json({
        success: true,
        rental: populated,
        related,
      });
    }

    const rental = await DecorationRental.findById(req.params.id).populate('category');
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental item not found' });
    }

    const related = await DecorationRental.find({
      category: rental.category._id,
      _id: { $ne: rental._id },
    }).limit(4);

    res.json({
      success: true,
      rental,
      related,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new rental item (Admin only)
// @route   POST /api/rentals
// @access  Private/Admin
export const createRental = async (req, res, next) => {
  try {
    const { title, description, category, rentalPrice, availableColors, availableSizes, quantityAvailable, images } = req.body;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const newRental = {
        _id: `rental_${Date.now()}`,
        title,
        description,
        category,
        rentalPrice: Number(rentalPrice),
        availableColors: Array.isArray(availableColors) ? availableColors : availableColors.split(',').map(c => c.trim()),
        availableSizes: Array.isArray(availableSizes) ? availableSizes : availableSizes.split(',').map(s => s.trim()),
        quantityAvailable: Number(quantityAvailable),
        images: Array.isArray(images) ? images : [images],
        availabilityStatus: Number(quantityAvailable) > 0 ? 'available' : 'unavailable',
        averageRating: 0,
        numReviews: 0,
        createdAt: new Date(),
      };
      mockDb.rentals.push(newRental);
      return res.status(201).json({
        success: true,
        rental: newRental,
      });
    }

    const rental = await DecorationRental.create({
      title,
      description,
      category,
      rentalPrice,
      availableColors: Array.isArray(availableColors) ? availableColors : availableColors.split(',').map(c => c.trim()),
      availableSizes: Array.isArray(availableSizes) ? availableSizes : availableSizes.split(',').map(s => s.trim()),
      quantityAvailable,
      images,
      availabilityStatus: quantityAvailable > 0 ? 'available' : 'unavailable',
    });

    res.status(201).json({
      success: true,
      rental,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update rental item (Admin only)
// @route   PUT /api/rentals/:id
// @access  Private/Admin
export const updateRental = async (req, res, next) => {
  try {
    const { title, description, category, rentalPrice, availableColors, availableSizes, quantityAvailable, images } = req.body;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const idx = mockDb.rentals.findIndex(r => r._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Rental item not found' });
      }

      const r = mockDb.rentals[idx];
      r.title = title || r.title;
      r.description = description || r.description;
      r.category = category || r.category;
      r.rentalPrice = rentalPrice !== undefined ? Number(rentalPrice) : r.rentalPrice;
      r.images = images || r.images;

      if (quantityAvailable !== undefined) {
        r.quantityAvailable = Number(quantityAvailable);
        r.availabilityStatus = r.quantityAvailable > 0 ? 'available' : 'unavailable';
      }

      if (availableColors) {
        r.availableColors = Array.isArray(availableColors) ? availableColors : availableColors.split(',').map(c => c.trim());
      }

      if (availableSizes) {
        r.availableSizes = Array.isArray(availableSizes) ? availableSizes : availableSizes.split(',').map(s => s.trim());
      }

      mockDb.rentals[idx] = r;
      return res.json({
        success: true,
        rental: r,
      });
    }

    let rental = await DecorationRental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental item not found' });
    }

    rental.title = title || rental.title;
    rental.description = description || rental.description;
    rental.category = category || rental.category;
    rental.rentalPrice = rentalPrice !== undefined ? rentalPrice : rental.rentalPrice;
    rental.images = images || rental.images;

    if (quantityAvailable !== undefined) {
      rental.quantityAvailable = quantityAvailable;
      rental.availabilityStatus = quantityAvailable > 0 ? 'available' : 'unavailable';
    }

    if (availableColors) {
      rental.availableColors = Array.isArray(availableColors) ? availableColors : availableColors.split(',').map(c => c.trim());
    }

    if (availableSizes) {
      rental.availableSizes = Array.isArray(availableSizes) ? availableSizes : availableSizes.split(',').map(s => s.trim());
    }

    const updated = await rental.save();

    res.json({
      success: true,
      rental: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete rental item (Admin only)
// @route   DELETE /api/rentals/:id
// @access  Private/Admin
export const deleteRental = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const idx = mockDb.rentals.findIndex(r => r._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Rental item not found' });
      }
      mockDb.rentals.splice(idx, 1);
      return res.json({
        success: true,
        message: 'Rental item deleted successfully',
      });
    }

    const rental = await DecorationRental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental item not found' });
    }

    await rental.deleteOne();

    res.json({
      success: true,
      message: 'Rental item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
