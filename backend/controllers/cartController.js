import Cart from '../models/Cart.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      if (!mockDb.carts[req.user._id]) {
        mockDb.carts[req.user._id] = [];
      }
      
      const populatedItems = mockDb.carts[req.user._id].map(item => {
        const docItem = item.decorItem ? mockDb.decorations.find(d => d._id === item.decorItem) : null;
        const rentItem = item.rentalItem ? mockDb.rentals.find(r => r._id === item.rentalItem) : null;
        
        return {
          ...item,
          decorItem: docItem ? { ...docItem, category: mockDb.categories.find(c => c._id === docItem.category) } : null,
          rentalItem: rentItem ? { ...rentItem, category: mockDb.categories.find(c => c._id === rentItem.category) } : null,
        };
      });

      return res.json({
        success: true,
        cart: {
          user: req.user._id,
          items: populatedItems,
        },
      });
    }

    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.decorItem')
      .populate('items.rentalItem');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { itemType, itemId, eventDate, eventTime, eventLocation, color, size, quantity } = req.body;

    if (!itemType || !itemId || !eventDate || !eventTime || !eventLocation) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields including date, time slot, and location' });
    }

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      if (!mockDb.carts[req.user._id]) {
        mockDb.carts[req.user._id] = [];
      }

      const cartItems = mockDb.carts[req.user._id];

      const itemIdx = cartItems.findIndex(item => {
        const isSameItem = itemType === 'Decoration' 
          ? item.decorItem === itemId 
          : item.rentalItem === itemId;
        
        const isSameConfig = item.eventDate === eventDate && 
                             item.eventTime === eventTime && 
                             item.color === color && 
                             item.size === size;
        
        return isSameItem && isSameConfig;
      });

      if (itemIdx > -1) {
        cartItems[itemIdx].quantity += Number(quantity || 1);
      } else {
        const newItem = {
          _id: `citem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          itemType,
          eventDate,
          eventTime,
          eventLocation,
          color,
          size,
          quantity: Number(quantity || 1),
        };

        if (itemType === 'Decoration') {
          newItem.decorItem = itemId;
        } else {
          newItem.rentalItem = itemId;
        }

        cartItems.push(newItem);
      }

      mockDb.carts[req.user._id] = cartItems;
      return getCart(req, res, next); // Return populated cart
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => {
      const isSameItem = itemType === 'Decoration' 
        ? item.decorItem && item.decorItem.toString() === itemId 
        : item.rentalItem && item.rentalItem.toString() === itemId;
      
      const isSameConfig = item.eventDate === eventDate && 
                           item.eventTime === eventTime && 
                           item.color === color && 
                           item.size === size;
      
      return isSameItem && isSameConfig;
    });

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity || 1);
    } else {
      const newItem = {
        itemType,
        eventDate,
        eventTime,
        eventLocation,
        color,
        size,
        quantity: Number(quantity || 1),
      };

      if (itemType === 'Decoration') {
        newItem.decorItem = itemId;
      } else {
        newItem.rentalItem = itemId;
      }

      cart.items.push(newItem);
    }

    cart.updatedAt = Date.now();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.decorItem')
      .populate('items.rentalItem');

    res.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item details/quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity, eventDate, eventTime, eventLocation, color, size } = req.body;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const cartItems = mockDb.carts[req.user._id] || [];
      const itemIdx = cartItems.findIndex(item => item._id === req.params.itemId);

      if (itemIdx === -1) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }

      if (quantity !== undefined) cartItems[itemIdx].quantity = Number(quantity);
      if (eventDate) cartItems[itemIdx].eventDate = eventDate;
      if (eventTime) cartItems[itemIdx].eventTime = eventTime;
      if (eventLocation) cartItems[itemIdx].eventLocation = eventLocation;
      if (color !== undefined) cartItems[itemIdx].color = color;
      if (size !== undefined) cartItems[itemIdx].size = size;

      mockDb.carts[req.user._id] = cartItems;
      return getCart(req, res, next);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    if (quantity !== undefined) cart.items[itemIndex].quantity = Number(quantity);
    if (eventDate) cart.items[itemIndex].eventDate = eventDate;
    if (eventTime) cart.items[itemIndex].eventTime = eventTime;
    if (eventLocation) cart.items[itemIndex].eventLocation = eventLocation;
    if (color !== undefined) cart.items[itemIndex].color = color;
    if (size !== undefined) cart.items[itemIndex].size = size;

    cart.updatedAt = Date.now();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.decorItem')
      .populate('items.rentalItem');

    res.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      if (mockDb.carts[req.user._id]) {
        mockDb.carts[req.user._id] = mockDb.carts[req.user._id].filter(
          item => item._id !== req.params.itemId
        );
      }
      return getCart(req, res, next);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    cart.updatedAt = Date.now();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.decorItem')
      .populate('items.rentalItem');

    res.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear user cart
// @route   POST /api/cart/clear
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      mockDb.carts[req.user._id] = [];
      return res.json({
        success: true,
        message: 'Cart cleared successfully',
        cart: { user: req.user._id, items: [] },
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart,
    });
  } catch (error) {
    next(error);
  }
};
