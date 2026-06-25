const Booking = require('../models/Booking');
const { sendEmailSafe, sendPaymentConfirmation } = require('../utils/email');
const User = require('../models/User');

// Razorpay is loaded lazily so app doesn't crash if not installed yet
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch {
  console.log('[Payment] razorpay package not installed — run: npm install razorpay');
}

const getRazorpayInstance = () => {
  if (!Razorpay) throw new Error('Razorpay not installed. Run: npm install razorpay');
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// POST /api/payments/create-order
// Creates a Razorpay order for a booking
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking already paid' });
    }

    const razorpay = getRazorpayInstance();

    // Razorpay expects amount in paise (₹1 = 100 paise)
    const order = await razorpay.orders.create({
      amount: booking.price * 100,
      currency: 'INR',
      receipt: `carryhand_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        customerId: req.user._id.toString(),
        location: booking.location.name
      }
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      booking: {
        _id: booking._id,
        price: booking.price,
        location: booking.location.name
      },
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments/verify
// Verifies Razorpay payment signature and marks booking as paid
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // Verify signature using HMAC SHA256
    const crypto = require('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
    }

    // Mark booking as paid
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      },
      { new: true }
    );

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Send payment confirmation email
    const customer = await User.findById(req.user._id);
    await sendEmailSafe(sendPaymentConfirmation,
      customer.email,
      customer.name,
      booking.price,
      razorpay_payment_id,
      booking
    );

    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/config
// Returns Razorpay key for frontend
exports.getConfig = async (req, res) => {
  res.json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_NOT_CONFIGURED',
    configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
};
