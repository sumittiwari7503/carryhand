const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Assistant = require('../models/Assistant');

exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, tags } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    if (booking.customer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.reviewGiven) return res.status(400).json({ success: false, message: 'Review already submitted' });

    const review = await Review.create({
      booking: bookingId,
      customer: req.user._id,
      assistant: booking.assistant,
      rating,
      comment,
      tags
    });

    // Update assistant rating
    const allReviews = await Review.find({ assistant: booking.assistant });
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
      : 0;
    await Assistant.findOneAndUpdate(
      { user: booking.assistant },
      { rating: parseFloat(avgRating.toFixed(1)), totalRatings: allReviews.length }
    );
    
    booking.reviewGiven = true;
    await booking.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssistantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ assistant: req.params.assistantId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
