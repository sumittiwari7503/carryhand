const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingById, updateBookingStatus, getPendingBookings, triggerSOS } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('customer'), createBooking);
router.get('/', getMyBookings);
router.get('/pending', authorize('assistant'), getPendingBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.post('/:id/sos', triggerSOS);

module.exports = router;
