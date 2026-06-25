const User = require('../models/User');
const Assistant = require('../models/Assistant');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalAssistants, totalBookings, pendingApprovals, activeBookings, revenueAgg] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'assistant' }),
      Booking.countDocuments(),
      Assistant.countDocuments({ isApproved: false }),
      Booking.countDocuments({ status: { $in: ['pending', 'accepted', 'active'] } }),
      Booking.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$price' } } }])
    ]);

    const recentBookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('assistant', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAssistants,
        totalBookings,
        pendingApprovals,
        activeBookings,
        totalRevenue: revenueAgg[0]?.total || 0
      },
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingAssistants = async (req, res) => {
  try {
    const assistants = await Assistant.find({ isApproved: false })
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: assistants.length, assistants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveAssistant = async (req, res) => {
  try {
    const { approve } = req.body;
    const assistant = await Assistant.findByIdAndUpdate(
      req.params.id,
      { isApproved: approve, approvedAt: approve ? Date.now() : null },
      { new: true }
    ).populate('user', 'name email');
    if (!assistant) return res.status(404).json({ success: false, message: 'Assistant not found' });
    res.json({ success: true, message: `Assistant ${approve ? 'approved' : 'rejected'}`, assistant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    const bookings = await Booking.find(query)
      .populate('customer', 'name email')
      .populate('assistant', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Booking.countDocuments(query);
    res.json({ success: true, bookings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
