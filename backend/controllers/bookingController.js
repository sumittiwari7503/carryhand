const Booking = require('../models/Booking');
const Assistant = require('../models/Assistant');
const User = require('../models/User');
const { sendEmailSafe, sendBookingConfirmation, sendBookingAccepted, sendNewBookingAlert, sendBookingCompleted } = require('../utils/email');

exports.createBooking = async (req, res) => {
  try {
    const { location, duration, notes, paymentMethod, scheduledAt } = req.body;
    if (!location || !duration) return res.status(400).json({ success: false, message: 'Location and duration required' });

    const booking = await Booking.create({
      customer: req.user._id,
      location,
      duration,
      notes,
      paymentMethod,
      scheduledAt: scheduledAt || Date.now()
    });
    await booking.populate('customer', 'name email phone');

    // Send confirmation email to customer
    await sendEmailSafe(sendBookingConfirmation,
      booking.customer.email,
      booking.customer.name,
      booking
    );

    // Notify online approved assistants
    const onlineAssistants = await Assistant.find({ isApproved: true, isOnline: true })
      .populate('user', 'name email').limit(5);
    for (const assistant of onlineAssistants) {
      if (assistant.user?.email) {
        await sendEmailSafe(sendNewBookingAlert,
          assistant.user.email,
          assistant.user.name,
          booking,
          booking.customer.name
        );
      }
    }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const query = req.user.role === 'customer' ? { customer: req.user._id } : { assistant: req.user._id };
    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone avatar')
      .populate('assistant', 'name email phone avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate('assistant', 'name email phone avatar');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const userId = req.user._id.toString();
    const role = req.user.role;

    // Role-based permission checks
    if (status === 'cancelled') {
      // Only the customer who created the booking can cancel it
      if (booking.customer.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Only the customer can cancel this booking' });
      }
    } else if (['accepted', 'rejected'].includes(status)) {
      // Only assistants can accept/reject
      if (role !== 'assistant') {
        return res.status(403).json({ success: false, message: 'Only assistants can accept or reject bookings' });
      }
    } else if (['active', 'completed'].includes(status)) {
      // Only the assigned assistant can start/complete
      if (role !== 'assistant' || (booking.assistant && booking.assistant.toString() !== userId)) {
        return res.status(403).json({ success: false, message: 'Only the assigned assistant can update this booking' });
      }
    }

    const allowedTransitions = {
      pending: ['accepted', 'rejected', 'cancelled'],
      accepted: ['active', 'cancelled'],
      active: ['completed'],
      completed: [],
      cancelled: [],
      rejected: []
    };

    if (!allowedTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${booking.status} to ${status}` });
    }

    booking.status = status;
    if (status === 'accepted') booking.assistant = req.user._id;
    if (status === 'active') booking.startTime = new Date();
    if (status === 'completed') {
      booking.endTime = new Date();
      const assistant = await Assistant.findOne({ user: req.user._id });
      if (assistant) {
        assistant.completedJobs += 1;
        assistant.totalEarnings += booking.price * 0.8;
        await assistant.save();
      }
    }
    await booking.save();
    await booking.populate('customer', 'name email phone avatar');
    await booking.populate('assistant', 'name email phone avatar');

    // Send emails based on status
    if (status === 'accepted' && booking.customer?.email) {
      await sendEmailSafe(sendBookingAccepted,
        booking.customer.email,
        booking.customer.name,
        booking,
        req.user.name
      );
    }
    if (status === 'completed' && booking.customer?.email) {
      await sendEmailSafe(sendBookingCompleted,
        booking.customer.email,
        booking.customer.name,
        booking,
        req.user.name
      );
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .populate('customer', 'name email phone avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.triggerSOS = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { sosTriggered: true }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    // In production: send emergency notification to admin + nearest support
    res.json({ success: true, message: 'SOS alert sent! Help is on the way.', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
