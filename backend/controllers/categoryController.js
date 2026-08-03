import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      let cats = mockDb.categories;
      if (type) {
        cats = cats.filter(c => c.type === type);
      }
      return res.json({
        success: true,
        categories: cats,
      });
    }

    let query = {};
    if (type) {
      query.type = type;
    }
    const categories = await Category.find(query).sort('name');
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, type } = req.body;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const exists = mockDb.categories.find(c => c.name === name);
      if (exists) {
        return res.status(400).json({ success: false, message: 'Category already exists' });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const category = {
        _id: `cat_${Date.now()}`,
        name,
        slug,
        description,
        type,
      };

      mockDb.categories.push(category);
      return res.status(201).json({
        success: true,
        category,
      });
    }
    
    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name, description, type });
    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const idx = mockDb.categories.findIndex(c => c._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      mockDb.categories.splice(idx, 1);
      return res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    await category.deleteOne();
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
