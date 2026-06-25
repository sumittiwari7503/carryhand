const express = require('express');
const router = express.Router();
const { createReview, getAssistantReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createReview);
router.get('/assistant/:assistantId', getAssistantReviews);

module.exports = router;
