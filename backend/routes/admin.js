const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getPendingAssistants, approveAssistant, getAllBookings, toggleUserStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/assistants/pending', getPendingAssistants);
router.put('/assistants/:id/approve', approveAssistant);
router.get('/bookings', getAllBookings);
router.put('/users/:id/toggle', toggleUserStatus);

module.exports = router;
