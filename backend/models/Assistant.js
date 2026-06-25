const mongoose = require('mongoose');

const assistantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, maxlength: 500 },
  idDocument: { type: String, default: '' },
  idVerified: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  languages: [{ type: String }],
  experience: { type: String },
  location: {
    city: { type: String },
    area: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Assistant', assistantSchema);
