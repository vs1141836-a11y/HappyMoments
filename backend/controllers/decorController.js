import Decoration from '../models/Decoration.js';
import Category from '../models/Category.js';

// @desc    Get all decoration packages (with search, category, theme, and price filters)
// @route   GET /api/decorations
// @access  Public
export const getDecorations = async (req, res, next) => {
  try {
    const { search, category, theme, minPrice, maxPrice, sort } = req.query;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      let decors = mockDb.decorations.map(d => ({
        ...d,
        category: mockDb.categories.find(c => c._id === d.category)
      }));

      // Search filter
      if (search) {
        const s = search.toLowerCase();
        decors = decors.filter(
          d => d.title.toLowerCase().includes(s) || 
               d.description.toLowerCase().includes(s) || 
               d.theme.toLowerCase().includes(s)
        );
      }

      // Category filter
      if (category) {
        const cat = mockDb.categories.find(c => c.slug === category || c._id === category);
        if (cat) {
          decors = decors.filter(d => d.category && d.category._id === cat._id);
        }
      }

      // Theme filter
      if (theme) {
        decors = decors.filter(d => d.theme.toLowerCase().includes(theme.toLowerCase()));
      }

      // Price filter
      if (minPrice) {
        decors = decors.filter(d => d.price >= Number(minPrice));
      }
      if (maxPrice) {
        decors = decors.filter(d => d.price <= Number(maxPrice));
      }

      // Sorting
      if (sort === 'priceAsc') {
        decors.sort((a,b) => a.price - b.price);
      } else if (sort === 'priceDesc') {
        decors.sort((a,b) => b.price - a.price);
      } else if (sort === 'rating') {
        decors.sort((a,b) => b.averageRating - a.averageRating);
      } else {
        // default newest
        decors.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }

      return res.json({
        success: true,
        count: decors.length,
        decorations: decors,
      });
    }

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { theme: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      const cat = await Category.findOne({ $or: [{ slug: category }, { _id: mongoose.isValidObjectId(category) ? category : null }] });
      if (cat) {
        query.category = cat._id;
      }
    }

    // Theme filter
    if (theme) {
      query.theme = { $regex: theme, $options: 'i' };
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let apiQuery = Decoration.find(query).populate('category');

    // Sorting
    if (sort) {
      if (sort === 'priceAsc') apiQuery = apiQuery.sort('price');
      else if (sort === 'priceDesc') apiQuery = apiQuery.sort('-price');
      else if (sort === 'rating') apiQuery = apiQuery.sort('-averageRating');
      else apiQuery = apiQuery.sort('-createdAt');
    } else {
      apiQuery = apiQuery.sort('-createdAt');
    }

    const decorations = await apiQuery;

    res.json({
      success: true,
      count: decorations.length,
      decorations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single decoration package by ID (with similar packages)
// @route   GET /api/decorations/:id
// @access  Public
export const getDecorationById = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const decoration = mockDb.decorations.find(d => d._id === req.params.id);
      if (!decoration) {
        return res.status(404).json({ success: false, message: 'Decoration package not found' });
      }

      const populated = {
        ...decoration,
        category: mockDb.categories.find(c => c._id === decoration.category)
      };

      const similar = mockDb.decorations
        .filter(d => d.category === decoration.category && d._id !== decoration._id)
        .slice(0, 4)
        .map(d => ({
          ...d,
          category: mockDb.categories.find(c => c._id === d.category)
        }));

      return res.json({
        success: true,
        decoration: populated,
        similar,
      });
    }

    const decoration = await Decoration.findById(req.params.id).populate('category');
    if (!decoration) {
      return res.status(404).json({ success: false, message: 'Decoration package not found' });
    }

    const similar = await Decoration.find({
      category: decoration.category._id,
      _id: { $ne: decoration._id },
    }).limit(4);

    res.json({
      success: true,
      decoration,
      similar,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new decoration package (Admin only)
// @route   POST /api/decorations
// @access  Private/Admin
export const createDecoration = async (req, res, next) => {
  try {
    const { title, description, category, theme, price, includedItems, images } = req.body;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const newDecor = {
        _id: `decor_${Date.now()}`,
        title,
        description,
        category,
        theme,
        price: Number(price),
        includedItems: Array.isArray(includedItems) ? includedItems : includedItems.split(',').map(i => i.trim()),
        images: Array.isArray(images) ? images : [images],
        averageRating: 0,
        numReviews: 0,
        createdAt: new Date(),
      };
      mockDb.decorations.push(newDecor);
      return res.status(201).json({
        success: true,
        decoration: newDecor,
      });
    }

    const decoration = await Decoration.create({
      title,
      description,
      category,
      theme,
      price,
      includedItems: Array.isArray(includedItems) ? includedItems : includedItems.split(',').map(i => i.trim()),
      images,
    });

    res.status(201).json({
      success: true,
      decoration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update decoration package (Admin only)
// @route   PUT /api/decorations/:id
// @access  Private/Admin
export const updateDecoration = async (req, res, next) => {
  try {
    const { title, description, category, theme, price, includedItems, images } = req.body;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const idx = mockDb.decorations.findIndex(d => d._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Decoration package not found' });
      }

      const d = mockDb.decorations[idx];
      d.title = title || d.title;
      d.description = description || d.description;
      d.category = category || d.category;
      d.theme = theme || d.theme;
      d.price = price !== undefined ? Number(price) : d.price;
      d.images = images || d.images;
      if (includedItems) {
        d.includedItems = Array.isArray(includedItems) ? includedItems : includedItems.split(',').map(i => i.trim());
      }

      mockDb.decorations[idx] = d;
      return res.json({
        success: true,
        decoration: d,
      });
    }

    let decoration = await Decoration.findById(req.params.id);
    if (!decoration) {
      return res.status(404).json({ success: false, message: 'Decoration package not found' });
    }

    decoration.title = title || decoration.title;
    decoration.description = description || decoration.description;
    decoration.category = category || decoration.category;
    decoration.theme = theme || decoration.theme;
    decoration.price = price !== undefined ? price : decoration.price;
    decoration.images = images || decoration.images;

    if (includedItems) {
      decoration.includedItems = Array.isArray(includedItems) ? includedItems : includedItems.split(',').map(i => i.trim());
    }

    const updated = await decoration.save();

    res.json({
      success: true,
      decoration: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete decoration package (Admin only)
// @route   DELETE /api/decorations/:id
// @access  Private/Admin
export const deleteDecoration = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const idx = mockDb.decorations.findIndex(d => d._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Decoration package not found' });
      }
      mockDb.decorations.splice(idx, 1);
      return res.json({
        success: true,
        message: 'Decoration package deleted successfully',
      });
    }

    const decoration = await Decoration.findById(req.params.id);
    if (!decoration) {
      return res.status(404).json({ success: false, message: 'Decoration package not found' });
    }

    await decoration.deleteOne();

    res.json({
      success: true,
      message: 'Decoration package deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
