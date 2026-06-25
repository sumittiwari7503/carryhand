const Assistant = require('../models/Assistant');
const User = require('../models/User');

exports.getAllAssistants = async (req, res) => {
  try {
    const { city, online } = req.query;
    let query = { isApproved: true };
    if (online === 'true') query.isOnline = true;
    if (city) query['location.city'] = new RegExp(city, 'i');

    const assistants = await Assistant.find(query)
      .populate('user', 'name email phone avatar')
      .sort({ rating: -1 });
    res.json({ success: true, count: assistants.length, assistants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssistantProfile = async (req, res) => {
  try {
    const assistant = await Assistant.findOne({ user: req.params.userId })
      .populate('user', 'name email phone avatar createdAt');
    if (!assistant) return res.status(404).json({ success: false, message: 'Assistant not found' });
    res.json({ success: true, assistant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const assistant = await Assistant.findOne({ user: req.user._id });
    if (!assistant) return res.status(404).json({ success: false, message: 'Assistant profile not found' });
    if (!assistant.isApproved) return res.status(403).json({ success: false, message: 'Profile not approved yet' });

    assistant.isOnline = !assistant.isOnline;
    await assistant.save();
    res.json({ success: true, isOnline: assistant.isOnline, message: `You are now ${assistant.isOnline ? 'online' : 'offline'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyAssistantProfile = async (req, res) => {
  try {
    const assistant = await Assistant.findOne({ user: req.user._id });
    if (!assistant) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, assistant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAssistantProfile = async (req, res) => {
  try {
    const { bio, languages, experience, location } = req.body;
    const assistant = await Assistant.findOneAndUpdate(
      { user: req.user._id },
      { bio, languages, experience, location },
      { new: true, runValidators: true }
    );
    if (!assistant) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, assistant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
