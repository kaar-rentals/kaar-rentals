const express = require("express");
const router = express.Router();
const User = require("../models/User");

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

module.exports = router;
