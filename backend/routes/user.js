const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// GET /api/user/profile/:unique_id - Get public user profile by unique_id
router.get("/profile/:unique_id", async (req, res) => {
  try {
    const { unique_id } = req.params;
    const user = await User.findOne({ unique_id }).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return public profile (include name and location)
    res.json({
      user: {
        _id: user._id,
        name: user.name || null,
        unique_id: user.unique_id,
        role: user.role,
        location: user.location || null
      }
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/user/me - Update authenticated user's profile (name, email, phone)
router.put("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id || req.user._id;
    const { name, email, phone } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Update user
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        unique_id: updatedUser.unique_id,
        location: updatedUser.location
      }
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/user/me - Get authenticated user's profile with listings count
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id || req.user._id;
    const Car = require("../models/Car");
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get listings count
    const listingsCount = await Car.countDocuments({ 
      $or: [
        { ownerId: userId },
        { owner: userId }
      ]
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        unique_id: user.unique_id,
        location: user.location,
        is_admin: user.is_admin,
        listingsCount
      }
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
