// backend/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Require phone, email is optional
    if (!phone || phone.trim().length === 0) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    
    // Validate phone format (7-15 digits)
    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return res.status(400).json({ error: "Phone number must be 7-15 digits" });
    }
    
    // Check if email provided and if it exists
    if (email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: "User with this email already exists" });
    }
    
    // Check if phone already exists
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) return res.status(400).json({ error: "User with this phone number already exists" });

    const hashed = await bcrypt.hash(password, 10);
    
    // Generate unique_id if not present
    const { nanoid } = require('nanoid');
    let unique_id = nanoid(10);
    let existingUniqueId = await User.findOne({ unique_id });
    while (existingUniqueId) {
      unique_id = nanoid(10);
      existingUniqueId = await User.findOne({ unique_id });
    }
    
    const user = await User.create({ 
      name: name || null, 
      email: email || null, 
      password: hashed,
      phone: phone.trim(),
      unique_id
    });

    // Generate token for auto-login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser };
