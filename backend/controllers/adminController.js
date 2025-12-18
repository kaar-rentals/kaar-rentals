// backend/controllers/adminController.js
const Car = require('../models/Car');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const ListingDraft = require('../models/ListingDraft');

const getDashboardStats = async (req, res) => {
  try {
    const totalCars = await Car.countDocuments();
    const activeCars = await Car.countDocuments({ isActive: true });
    const pendingCars = await Car.countDocuments({ isApproved: false });
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'SUCCEEDED' } },
      { $group: { _id: null, total: { $sum: '$settledAmountInPaise' } } }
    ]);

    res.json({
      totalCars,
      activeCars,
      pendingCars,
      totalUsers,
      totalOwners,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPendingCars = async (req, res) => {
  try {
    const cars = await Car.find({ isApproved: false })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const approveCar = async (req, res) => {
  try {
    const { featured } = req.body; // Admin can set featured status
    const updateData = { 
      isApproved: true,
      paymentStatus: 'PAID' // Admin bypass: approve without payment
    };
    
    if (featured !== undefined) {
      updateData.featured = featured;
    }
    
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('owner', 'name email');
    
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rejectCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isApproved: false },
      { new: true }
    ).populate('owner', 'name email');
    
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /api/admin/users/:id/toggle-owner
 * Toggle user's owner status (user <-> owner)
 */
const toggleOwnerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Toggle between 'user' and 'owner'
    const newRole = user.role === 'owner' ? 'user' : 'owner';
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role: newRole },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('car', 'brand model year')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/payments
 * Get all payments with audit trail
 */
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email phone')
      .populate('listingDraftId')
      .sort({ createdAt: -1 })
      .limit(100); // Limit for performance

    const paymentsWithDetails = payments.map(payment => ({
      _id: payment._id,
      user: payment.user,
      type: payment.type,
      status: payment.status,
      requestedAmountInPaise: payment.requestedAmountInPaise,
      settledAmountInPaise: payment.settledAmountInPaise,
      gatewayFeesInPaise: payment.gatewayFeesInPaise,
      netAmountInPaise: payment.settledAmountInPaise && payment.gatewayFeesInPaise 
        ? payment.settledAmountInPaise - payment.gatewayFeesInPaise 
        : null,
      providerRef: payment.providerRef,
      listingDraft: payment.listingDraftId,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
      failedAt: payment.failedAt,
      webhookReceived: payment.webhookReceived
    }));

    res.json({ payments: paymentsWithDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/payments/stats
 * Get payment statistics for admin dashboard
 */
const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRequested: { $sum: '$requestedAmountInPaise' },
          totalSettled: { $sum: '$settledAmountInPaise' },
          totalFees: { $sum: '$gatewayFeesInPaise' }
        }
      }
    ]);

    const totalStats = await Payment.aggregate([
      { $match: { status: 'SUCCEEDED' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$settledAmountInPaise' },
          totalFees: { $sum: '$gatewayFeesInPaise' },
          netRevenue: { 
            $sum: { 
              $subtract: ['$settledAmountInPaise', { $ifNull: ['$gatewayFeesInPaise', 0] }] 
            } 
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusBreakdown: stats,
      totalStats: totalStats[0] || { totalRevenue: 0, totalFees: 0, netRevenue: 0, count: 0 }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/listing-drafts
 * Get all listing drafts for audit
 */
const getListingDrafts = async (req, res) => {
  try {
    const drafts = await ListingDraft.find()
      .populate('ownerId', 'name email phone')
      .populate('publishedListingId')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ drafts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getPendingCars,
  approveCar,
  rejectCar,
  getAllUsers,
  updateUserRole,
  toggleOwnerStatus,
  getAllCars,
  getRecentBookings,
  getAllPayments,
  getPaymentStats,
  getListingDrafts
};

