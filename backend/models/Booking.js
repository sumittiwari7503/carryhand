const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assistant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    name: { type: String, required: true },
    address: { type: String, required: true, default: 'Address not provided' },
    type: { type: String, enum: ['mall', 'market', 'airport', 'railway', 'tourist', 'other'], default: 'mall' },
    coordinates: { lat: Number, lng: Number }
  },
  duration: { type: Number, required: true, min: 1, max: 8 }, // hours
  status: {
    type: String,
    enum: ['pending', 'accepted', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  startTime: { type: Date },
  endTime: { type: Date },
  scheduledAt: { type: Date, default: Date.now },
  price: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'wallet'], default: 'cash' },
  notes: { type: String, maxlength: 500 },
  cancelReason: { type: String },
  sosTriggered: { type: Boolean, default: false },
  reviewGiven: { type: Boolean, default: false },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String }
}, { timestamps: true });

// Calculate price before saving
bookingSchema.pre('validate', function (next) {
  const ratePerHour = 150; // ₹150/hour
  if (this.duration) this.price = this.duration * ratePerHour;
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
