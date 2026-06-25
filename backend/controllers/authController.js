const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Assistant = require('../models/Assistant');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const allowedRoles = ['customer', 'assistant'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';
    const user = await User.create({ name, email, password, phone, role: userRole });

    if (userRole === 'assistant') {
      await Assistant.create({ user: user._id });
    }

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });

    const token = generateToken(user._id);
    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    let assistantProfile = null;
    if (user.role === 'assistant') {
      assistantProfile = await Assistant.findOne({ user: user._id });
    }
    res.json({ success: true, user, assistantProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, bio, languages, experience, location } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Use the freshly fetched user's role (not stale req.user)
    if (user.role === 'assistant') {
      await Assistant.findOneAndUpdate(
        { user: req.user._id },
        { bio, languages, experience, location },
        { new: true, upsert: false }
      );
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
