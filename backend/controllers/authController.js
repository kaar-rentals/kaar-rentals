// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateUniqueId = require("../utils/generateUniqueId");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    
    // Generate unique_id with collision handling
    let uniqueId;
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      uniqueId = generateUniqueId();
      const existingWithId = await User.findOne({ unique_id: uniqueId });
      if (!existingWithId) break;
      attempts++;
    }
    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: "Failed to generate unique ID. Please try again." });
    }

    const newUser = new User({
      name,
      email,
      password: hashed,
      role: "user",
      unique_id: uniqueId,
      is_admin: false,
      membershipActive: false
    });
    
    await newUser.save();
    res.json({ 
      _id: newUser._id, 
      name: newUser.name, 
      email: newUser.email, 
      role: newUser.role,
      unique_id: newUser.unique_id,
      is_admin: newUser.is_admin,
      membershipActive: newUser.membershipActive 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user in database
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ 
      token, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        unique_id: user.unique_id,
        is_admin: user.is_admin || user.role === 'admin',
        membershipActive: user.membershipActive,
        membershipPlan: user.membershipPlan
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    // If user is authenticated (req.user set by optional auth middleware)
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id).select('-password');
      if (user) {
        return res.json({ 
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            unique_id: user.unique_id,
            is_admin: user.is_admin || user.role === 'admin',
            membershipActive: user.membershipActive,
            membershipPlan: user.membershipPlan
          }
        });
      }
    }
    // Return null user when not authenticated
    return res.json({ user: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, getMe };