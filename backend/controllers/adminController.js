import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Decoration from '../models/Decoration.js';
import DecorationRental from '../models/DecorationRental.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');

      // 1. Calculate General Metrics
      const totalUsers = mockDb.users.filter(u => u.role === 'customer').length;
      const totalDecorations = mockDb.decorations.length;
      const totalRentals = mockDb.rentals.length;
      const totalReviews = mockDb.reviews.length;

      // 2. Calculate Total Revenue from Paid Bookings
      const paidBookings = mockDb.bookings.filter(b => b.paymentStatus === 'paid');
      const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0);

      // 3. Count Total Bookings
      const totalBookings = mockDb.bookings.length;
      const confirmedBookings = paidBookings.length;

      // 4. Monthly Bookings Statistics (for Charts)
      const monthlyStatsMap = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      paidBookings.forEach(b => {
        const date = new Date(b.createdAt);
        const month = date.getMonth();
        const year = date.getFullYear();
        const key = `${monthNames[month]} ${year}`;

        if (!monthlyStatsMap[key]) {
          monthlyStatsMap[key] = { bookings: 0, revenue: 0 };
        }
        monthlyStatsMap[key].bookings += 1;
        monthlyStatsMap[key].revenue += b.totalAmount;
      });

      const formattedMonthlyStats = Object.keys(monthlyStatsMap).map(key => ({
        name: key,
        bookings: monthlyStatsMap[key].bookings,
        revenue: monthlyStatsMap[key].revenue,
      }));

      // 5. Popular Decoration Packages
      const popularDecorMap = {};
      paidBookings.forEach(b => {
        b.items.forEach(item => {
          if (item.itemType === 'Decoration') {
            const id = item.decorItem;
            if (!popularDecorMap[id]) {
              popularDecorMap[id] = { title: item.title, count: 0, revenue: 0 };
            }
            popularDecorMap[id].count += item.quantity;
            popularDecorMap[id].revenue += item.price * item.quantity;
          }
        });
      });

      const popularDecorations = Object.keys(popularDecorMap)
        .map(id => ({ _id: id, ...popularDecorMap[id] }))
        .sort((a,b) => b.count - a.count)
        .slice(0, 5);

      // 6. Popular Rental Props
      const popularRentalMap = {};
      paidBookings.forEach(b => {
        b.items.forEach(item => {
          if (item.itemType === 'DecorationRental') {
            const id = item.rentalItem;
            if (!popularRentalMap[id]) {
              popularRentalMap[id] = { title: item.title, count: 0, revenue: 0 };
            }
            popularRentalMap[id].count += item.quantity;
            popularRentalMap[id].revenue += item.price * item.quantity;
          }
        });
      });

      const popularRentals = Object.keys(popularRentalMap)
        .map(id => ({ _id: id, ...popularRentalMap[id] }))
        .sort((a,b) => b.count - a.count)
        .slice(0, 5);

      // 7. Recent Orders (limit to 5)
      const recentOrders = mockDb.bookings
        .map(b => ({
          ...b,
          user: mockDb.users.find(u => u._id === b.user),
        }))
        .sort((a,b) => b.createdAt - a.createdAt)
        .slice(0, 5);

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalDecorations,
          totalRentals,
          totalReviews,
          totalRevenue,
          totalBookings,
          confirmedBookings,
          monthlyStats: formattedMonthlyStats.length > 0 ? formattedMonthlyStats : [{ name: monthNames[new Date().getMonth()] + ' ' + new Date().getFullYear(), bookings: 0, revenue: 0 }],
          popularDecorations,
          popularRentals,
          recentOrders,
        },
      });
    }

    // Connect to actual database
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalDecorations = await Decoration.countDocuments();
    const totalRentals = await DecorationRental.countDocuments();
    const totalReviews = await Review.countDocuments();

    const revenueStats = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ paymentStatus: 'paid' });

    const monthlyStats = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $project: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
          amount: '$totalAmount',
        },
      },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyStats = monthlyStats.map(stat => ({
      name: `${monthNames[stat._id.month - 1]} ${stat._id.year}`,
      bookings: stat.count,
      revenue: stat.revenue,
    }));

    const popularDecorStats = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $match: { 'items.itemType': 'Decoration' } },
      {
        $group: {
          _id: '$items.decorItem',
          title: { $first: '$items.title' },
          count: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const popularRentalStats = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $match: { 'items.itemType': 'DecorationRental' } },
      {
        $group: {
          _id: '$items.rentalItem',
          title: { $first: '$items.title' },
          count: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const recentOrders = await Booking.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDecorations,
        totalRentals,
        totalReviews,
        totalRevenue,
        totalBookings,
        confirmedBookings,
        monthlyStats: formattedMonthlyStats,
        popularDecorations: popularDecorStats,
        popularRentals: popularRentalStats,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsersAdmin = async (req, res, next) => {
  try {
    if (global.isMockDB) {
      const { mockDb } = await import('../utils/mockDb.js');
      const customers = mockDb.users.filter(u => u.role === 'customer');
      return res.json({
        success: true,
        count: customers.length,
        users: customers,
      });
    }

    const users = await User.find({ role: 'customer' }).sort('-createdAt');
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};
