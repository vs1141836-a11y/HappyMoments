import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Decoration from '../models/Decoration.js';
import DecorationRental from '../models/DecorationRental.js';
import Payment from '../models/Payment.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from '../services/emailService.js';
import { generateInvoicePDF } from '../services/invoiceService.js';

// Initialize Razorpay
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || keyId.includes('dummy') || !keySecret || keySecret.includes('dummy')) {
    return null;
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

// @desc    Check item availability for a specific date
// @route   POST /api/bookings/check-availability
// @access  Public
export const checkAvailability = async (req, res, next) => {
  try {
    const { items, eventDate } = req.body;

    if (!items || !eventDate) {
      return res.status(400).json({ success: false, message: 'Please provide items and event date' });
    }

    const conflicts = [];

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      
      for (const item of items) {
        if (item.itemType === 'Decoration') {
          const isBooked = mockDb.bookings.some(
            b => b.eventDate === eventDate && 
                 b.paymentStatus === 'paid' && 
                 b.items.some(bi => bi.itemType === 'Decoration' && bi.decorItem === item.itemId)
          );

          if (isBooked) {
            conflicts.push({
              itemId: item.itemId,
              title: item.title,
              message: `Decoration package "${item.title}" is already booked on ${eventDate}. Please select another date.`,
            });
          }
        } else {
          const rental = mockDb.rentals.find(r => r._id === item.itemId);
          if (!rental) continue;

          let rentedQuantity = 0;
          mockDb.bookings.forEach(b => {
            if (b.eventDate === eventDate && b.paymentStatus === 'paid') {
              b.items.forEach(bi => {
                if (bi.itemType === 'DecorationRental' && bi.rentalItem === item.itemId) {
                  rentedQuantity += bi.quantity;
                }
              });
            }
          });

          const requestedQuantity = Number(item.quantity || 1);
          if (rentedQuantity + requestedQuantity > rental.quantityAvailable) {
            const remaining = rental.quantityAvailable - rentedQuantity;
            conflicts.push({
              itemId: item.itemId,
              title: item.title,
              message: `Rental prop "${item.title}" has insufficient stock on ${eventDate}. Only ${remaining > 0 ? remaining : '0'} available (requested ${requestedQuantity}).`,
            });
          }
        }
      }

      return res.json({
        success: true,
        available: conflicts.length === 0,
        conflicts,
      });
    }

    const dbConflicts = [];

    for (const item of items) {
      if (item.itemType === 'Decoration') {
        const existingBooking = await Booking.findOne({
          eventDate,
          paymentStatus: 'paid',
          'items.decorItem': item.itemId,
        });

        if (existingBooking) {
          dbConflicts.push({
            itemId: item.itemId,
            title: item.title,
            message: `Decoration package "${item.title}" is already booked on ${eventDate}. Please select another date.`,
          });
        }
      } else {
        const rental = await DecorationRental.findById(item.itemId);
        if (!rental) continue;

        const bookingsOnDate = await Booking.find({
          eventDate,
          paymentStatus: 'paid',
          'items.rentalItem': item.itemId,
        });

        let rentedQuantity = 0;
        bookingsOnDate.forEach(b => {
          b.items.forEach(bi => {
            if (bi.rentalItem && bi.rentalItem.toString() === item.itemId) {
              rentedQuantity += bi.quantity;
            }
          });
        });

        const requestedQuantity = Number(item.quantity || 1);
        if (rentedQuantity + requestedQuantity > rental.quantityAvailable) {
          const remaining = rental.quantityAvailable - rentedQuantity;
          dbConflicts.push({
            itemId: item.itemId,
            title: item.title,
            message: `Rental prop "${item.title}" has insufficient stock on ${eventDate}. Only ${remaining > 0 ? remaining : '0'} available (requested ${requestedQuantity}).`,
          });
        }
      }
    }

    res.json({
      success: true,
      available: dbConflicts.length === 0,
      conflicts: dbConflicts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create booking and initiate Razorpay payment
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { items, eventDate, eventTime, eventLocation } = req.body;

    if (!items || items.length === 0 || !eventDate || !eventTime || !eventLocation) {
      return res.status(400).json({ success: false, message: 'Please provide event details and items' });
    }

    // 1. Availability check & calculation
    const conflicts = [];
    const formattedItems = [];
    let subtotal = 0;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');

      for (const item of items) {
        if (item.itemType === 'Decoration') {
          const decor = mockDb.decorations.find(d => d._id === item.itemId);
          if (!decor) {
            return res.status(404).json({ success: false, message: `Decoration package not found` });
          }

          const isBooked = mockDb.bookings.some(
            b => b.eventDate === eventDate && 
                 b.paymentStatus === 'paid' && 
                 b.items.some(bi => bi.itemType === 'Decoration' && bi.decorItem === item.itemId)
          );

          if (isBooked) {
            conflicts.push(`"${decor.title}" is already booked on ${eventDate}`);
          }

          subtotal += decor.price;
          formattedItems.push({
            itemType: 'Decoration',
            decorItem: decor._id,
            title: decor.title,
            price: decor.price,
            quantity: 1,
          });
        } else {
          const rental = mockDb.rentals.find(r => r._id === item.itemId);
          if (!rental) {
            return res.status(404).json({ success: false, message: `Rental item not found` });
          }

          let rentedQuantity = 0;
          mockDb.bookings.forEach(b => {
            if (b.eventDate === eventDate && b.paymentStatus === 'paid') {
              b.items.forEach(bi => {
                if (bi.itemType === 'DecorationRental' && bi.rentalItem === item.itemId) {
                  rentedQuantity += bi.quantity;
                }
              });
            }
          });

          const requestedQty = Number(item.quantity || 1);
          if (rentedQuantity + requestedQty > rental.quantityAvailable) {
            const availableLeft = rental.quantityAvailable - rentedQuantity;
            conflicts.push(`"${rental.title}" has only ${availableLeft > 0 ? availableLeft : '0'} available on ${eventDate} (requested ${requestedQty})`);
          }

          subtotal += (rental.rentalPrice * requestedQty);
          formattedItems.push({
            itemType: 'DecorationRental',
            rentalItem: rental._id,
            title: rental.title,
            price: rental.rentalPrice,
            color: item.color,
            size: item.size,
            quantity: requestedQty,
          });
        }
      }

      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Booking conflict detected. Some items are unavailable on your event date.',
          conflicts,
        });
      }

      const taxAmount = Math.round(subtotal * 0.18);
      const shippingFee = 1500;
      const totalAmount = subtotal + taxAmount + shippingFee;

      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const bookingId = `HM-${dateStr}-${randomDigits}`;

      const mockBooking = {
        _id: `book_${Date.now()}`,
        bookingId,
        user: req.user._id,
        items: formattedItems,
        eventDate,
        eventTime,
        eventLocation,
        taxAmount,
        shippingFee,
        totalAmount,
        paymentStatus: 'unpaid',
        bookingStatus: 'pending',
        razorpayOrderId: `mock_order_${bookingId}`,
        trackingTimeline: [
          {
            _id: `tline_${Date.now()}`,
            status: 'pending',
            title: 'Booking Placed',
            description: 'Your booking has been registered and is awaiting payment verification.',
            timestamp: new Date(),
          }
        ],
        createdAt: new Date(),
      };

      mockDb.bookings.push(mockBooking);

      return res.status(201).json({
        success: true,
        booking: mockBooking,
        isSimulated: true,
        razorpayKeyId: 'rzp_test_dummykeyid123',
      });
    }

    // Connect to actual database
    for (const item of items) {
      if (item.itemType === 'Decoration') {
        const decor = await Decoration.findById(item.itemId);
        if (!decor) {
          return res.status(404).json({ success: false, message: `Decoration package not found` });
        }

        const isBooked = await Booking.findOne({
          eventDate,
          paymentStatus: 'paid',
          'items.decorItem': item.itemId,
        });

        if (isBooked) {
          conflicts.push(`"${decor.title}" is already booked on ${eventDate}`);
        }

        subtotal += decor.price;
        formattedItems.push({
          itemType: 'Decoration',
          decorItem: decor._id,
          title: decor.title,
          price: decor.price,
          quantity: 1,
        });
      } else {
        const rental = await DecorationRental.findById(item.itemId);
        if (!rental) {
          return res.status(404).json({ success: false, message: `Rental item not found` });
        }

        const bookingsOnDate = await Booking.find({
          eventDate,
          paymentStatus: 'paid',
          'items.rentalItem': item.itemId,
        });

        let rentedQuantity = 0;
        bookingsOnDate.forEach(b => {
          b.items.forEach(bi => {
            if (bi.rentalItem && bi.rentalItem.toString() === item.itemId) {
              rentedQuantity += bi.quantity;
            }
          });
        });

        const requestedQty = Number(item.quantity || 1);
        if (rentedQuantity + requestedQty > rental.quantityAvailable) {
          const availableLeft = rental.quantityAvailable - rentedQuantity;
          conflicts.push(`"${rental.title}" has only ${availableLeft > 0 ? availableLeft : '0'} available on ${eventDate} (requested ${requestedQty})`);
        }

        subtotal += (rental.rentalPrice * requestedQty);
        formattedItems.push({
          itemType: 'DecorationRental',
          rentalItem: rental._id,
          title: rental.title,
          price: rental.rentalPrice,
          color: item.color,
          size: item.size,
          quantity: requestedQty,
        });
      }
    }

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Booking conflict detected. Some items are unavailable on your event date.',
        conflicts,
      });
    }

    const taxAmount = Math.round(subtotal * 0.18);
    const shippingFee = 1500;
    const totalAmount = subtotal + taxAmount + shippingFee;

    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `HM-${dateStr}-${randomDigits}`;

    const rzp = getRazorpayInstance();
    let rzpOrder = null;

    if (rzp) {
      try {
        const options = {
          amount: totalAmount * 100,
          currency: 'INR',
          receipt: `receipt_${bookingId}`,
        };
        rzpOrder = await rzp.orders.create(options);
      } catch (err) {
        console.error('Razorpay order creation failed:', err);
        return res.status(500).json({ success: false, message: 'Payment gateway initialization failed' });
      }
    }

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      items: formattedItems,
      eventDate,
      eventTime,
      eventLocation,
      taxAmount,
      shippingFee,
      totalAmount,
      paymentStatus: 'unpaid',
      bookingStatus: 'pending',
      razorpayOrderId: rzpOrder ? rzpOrder.id : `mock_order_${bookingId}`,
    });

    res.status(201).json({
      success: true,
      booking,
      isSimulated: !rzp,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature and finalize booking
// @route   POST /api/bookings/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !bookingId) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const idx = mockDb.bookings.findIndex(b => b._id === bookingId);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const booking = mockDb.bookings[idx];
      booking.paymentStatus = 'paid';
      booking.bookingStatus = 'confirmed';
      booking.razorpayPaymentId = razorpay_payment_id || `mock_pay_${Date.now()}`;
      booking.razorpaySignature = razorpay_signature || `mock_sig_${Date.now()}`;
      booking.trackingTimeline.push({
        status: 'confirmed',
        title: 'Payment Confirmed',
        description: 'Your payment was verified. Decor preparation and transport schedules are being generated.',
        timestamp: new Date(),
      });

      mockDb.bookings[idx] = booking;

      // Log payment
      mockDb.payments.push({
        _id: `pay_${Date.now()}`,
        booking: booking._id,
        user: req.user._id,
        amount: booking.totalAmount,
        razorpayOrderId: booking.razorpayOrderId,
        razorpayPaymentId: booking.razorpayPaymentId,
        status: 'success',
        createdAt: new Date(),
      });

      // Clear Cart
      mockDb.carts[req.user._id] = [];

      // Send mail alerts
      const populatedUser = mockDb.users.find(u => u._id === req.user._id);
      sendBookingConfirmationEmail(booking, populatedUser);
      sendAdminNotificationEmail(booking, populatedUser);

      return res.json({
        success: true,
        message: 'Payment verified and booking confirmed successfully',
        booking,
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const rzp = getRazorpayInstance();
    let isSignatureValid = false;

    if (rzp) {
      const text = razorpay_order_id + '|' + razorpay_payment_id;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      isSignatureValid = generated_signature === razorpay_signature;
    } else {
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      booking.paymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    booking.razorpayPaymentId = razorpay_payment_id || `mock_pay_${Date.now()}`;
    booking.razorpaySignature = razorpay_signature || `mock_sig_${Date.now()}`;
    booking.trackingTimeline.push({
      status: 'confirmed',
      title: 'Payment Confirmed',
      description: 'Your payment was verified. Decor preparation and transport schedules are being generated.',
    });

    const confirmedBooking = await booking.save();

    await Payment.create({
      booking: confirmedBooking._id,
      user: req.user._id,
      amount: confirmedBooking.totalAmount,
      razorpayOrderId: confirmedBooking.razorpayOrderId,
      razorpayPaymentId: confirmedBooking.razorpayPaymentId,
      status: 'success',
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

    const populatedUser = await User.findById(req.user._id);
    sendBookingConfirmationEmail(confirmedBooking, populatedUser);
    sendAdminNotificationEmail(confirmedBooking, populatedUser);

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully',
      booking: confirmedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/history
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const bookings = mockDb.bookings
        .filter(b => b.user === req.user._id)
        .sort((a,b) => b.createdAt - a.createdAt);

      return res.json({
        success: true,
        count: bookings.length,
        bookings,
      });
    }

    const bookings = await Booking.find({ user: req.user._id }).sort('-createdAt');
    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const booking = mockDb.bookings.find(b => b._id === req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.user !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
      }

      // Populate items in mock DB
      const populatedItems = booking.items.map(item => {
        const docItem = item.decorItem ? mockDb.decorations.find(d => d._id === item.decorItem) : null;
        const rentItem = item.rentalItem ? mockDb.rentals.find(r => r._id === item.rentalItem) : null;
        return {
          ...item,
          decorItem,
          rentalItem,
        };
      });

      const populatedBooking = {
        ...booking,
        user: mockDb.users.find(u => u._id === booking.user),
        items: populatedItems,
      };

      return res.json({
        success: true,
        booking: populatedBooking,
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email contact')
      .populate('items.decorItem')
      .populate('items.rentalItem');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download PDF Invoice for a booking
// @route   GET /api/bookings/:id/invoice
// @access  Private
export const downloadInvoice = async (req, res, next) => {
  try {
    let booking;
    let user;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const b = mockDb.bookings.find(x => x._id === req.params.id);
      if (!b) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      
      if (b.user !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to download this invoice' });
      }

      booking = b;
      user = mockDb.users.find(u => u._id === b.user);
    } else {
      booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to download this invoice' });
      }
      user = await User.findById(booking.user);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${booking.bookingId}.pdf`);

    generateInvoicePDF(booking, user, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
export const getAllBookingsAdmin = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const populated = mockDb.bookings.map(b => ({
        ...b,
        user: mockDb.users.find(u => u._id === b.user),
      })).sort((a,b) => b.createdAt - a.createdAt);

      return res.json({
        success: true,
        count: populated.length,
        bookings: populated,
      });
    }

    const bookings = await Booking.find()
      .populate('user', 'name email contact')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking tracking status and timeline (Admin only)
// @route   PUT /api/bookings/admin/:id/status
// @access  Private/Admin
export const updateBookingStatusAdmin = async (req, res, next) => {
  try {
    const { status, title, description } = req.body;

    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const idx = mockDb.bookings.findIndex(b => b._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const booking = mockDb.bookings[idx];
      if (status) {
        booking.bookingStatus = status;
        booking.trackingTimeline.push({
          status,
          title: title || `Booking Status: ${status}`,
          description: description || `Status updated to ${status} by coordinator.`,
          timestamp: new Date(),
        });
      }

      mockDb.bookings[idx] = booking;
      return res.json({
        success: true,
        booking,
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (status) {
      booking.bookingStatus = status;
      booking.trackingTimeline.push({
        status,
        title: title || `Booking Status: ${status}`,
        description: description || `Status updated to ${status} by coordinator.`,
      });
    }

    const updated = await booking.save();
    res.json({
      success: true,
      booking: updated,
    });
  } catch (error) {
    next(error);
  }
};
