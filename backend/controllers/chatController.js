const Message = require('../models/Message');
const Booking = require('../models/Booking');

// GET /api/chat/:bookingId — get all messages for a booking
exports.getMessages = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Verify user is part of this booking
    const userId = req.user._id.toString();
    const isCustomer = booking.customer.toString() === userId;
    const isAssistant = booking.assistant?.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isAssistant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ booking: req.params.bookingId })
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { booking: req.params.bookingId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/chat/:bookingId — save a message (REST fallback)
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message text required' });

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const userId = req.user._id.toString();
    const isCustomer = booking.customer.toString() === userId;
    const isAssistant = booking.assistant?.toString() === userId;

    if (!isCustomer && !isAssistant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = await Message.create({
      booking: req.params.bookingId,
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      text: text.trim()
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
