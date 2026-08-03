import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, contact } = req.body;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const exists = mockDb.users.find(u => u.email === email);
      if (exists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: `user_${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        role: 'customer',
        contact,
        wishlistDecorations: [],
        wishlistRentals: [],
      };

      mockDb.users.push(newUser);

      return res.status(201).json({
        success: true,
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        contact: newUser.contact,
        token: generateToken(newUser._id),
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      contact,
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const user = mockDb.users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        token: generateToken(user._id),
      });
    }

    // Check for user email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      contact: user.contact,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const user = mockDb.users.find(u => u._id === req.user._id);
      if (user) {
        const popDecor = (user.wishlistDecorations || []).map(id => mockDb.decorations.find(d => d._id === id)).filter(Boolean);
        const popRent = (user.wishlistRentals || []).map(id => mockDb.rentals.find(r => r._id === id)).filter(Boolean);
        return res.json({
          success: true,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          contact: user.contact,
          wishlistDecorations: popDecor,
          wishlistRentals: popRent,
        });
      } else {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    const user = await User.findById(req.user._id)
      .populate('wishlistDecorations')
      .populate('wishlistRentals');
      
    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        wishlistDecorations: user.wishlistDecorations,
        wishlistRentals: user.wishlistRentals,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const idx = mockDb.users.findIndex(u => u._id === req.user._id);
      if (idx !== -1) {
        mockDb.users[idx].name = req.body.name || mockDb.users[idx].name;
        mockDb.users[idx].contact = req.body.contact || mockDb.users[idx].contact;

        if (req.body.password) {
          const salt = await bcrypt.genSalt(10);
          mockDb.users[idx].password = await bcrypt.hash(req.body.password, salt);
        }

        const user = mockDb.users[idx];
        return res.json({
          success: true,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          contact: user.contact,
          token: generateToken(user._id),
        });
      } else {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.contact = req.body.contact || user.contact;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        contact: updatedUser.contact,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    let exists = false;
    let userId = null;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const user = mockDb.users.find(u => u.email === email);
      if (user) {
        exists = true;
        userId = user._id;
      }
    } else {
      const user = await User.findOne({ email });
      if (user) {
        exists = true;
        userId = user._id;
      }
    }

    if (!exists) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    const resetToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'supersecretkey', {
      expiresIn: '10m',
    });

    res.json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const idx = mockDb.users.findIndex(u => u._id === decoded.id);
      if (idx !== -1) {
        const salt = await bcrypt.genSalt(10);
        mockDb.users[idx].password = await bcrypt.hash(password, salt);
        return res.json({
          success: true,
          message: 'Password reset successful. Please login with your new password.',
        });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
      }
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = password;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
  }
};
