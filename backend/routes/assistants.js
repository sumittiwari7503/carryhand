const express = require('express');
const router = express.Router();
const { getAllAssistants, getAssistantProfile, toggleAvailability, getMyAssistantProfile, updateAssistantProfile } = require('../controllers/assistantController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllAssistants);
router.get('/me', protect, authorize('assistant'), getMyAssistantProfile);
router.put('/me', protect, authorize('assistant'), updateAssistantProfile);
router.put('/toggle-availability', protect, authorize('assistant'), toggleAvailability);
router.get('/:userId', getAssistantProfile);

module.exports = router;
