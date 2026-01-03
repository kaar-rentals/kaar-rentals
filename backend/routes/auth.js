const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { asHandler } = require("./_routeHelpers");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Optional helpful diagnostics in dev:
try {
  // Verify controller exports are valid
  if (typeof registerUser !== 'function' && typeof registerUser !== 'undefined') {
    console.warn('auth route: registerUser export shape:', typeof registerUser, Object.keys(registerUser || {}));
  }
  if (typeof loginUser !== 'function' && typeof loginUser !== 'undefined') {
    console.warn('auth route: loginUser export shape:', typeof loginUser, Object.keys(loginUser || {}));
  }
} catch(e) {
  console.error('auth route import diagnostics error:', e);
}

router.post("/register", asHandler(registerUser));
router.post("/login", asHandler(loginUser));

// GET /api/auth/profile - Return current authenticated user
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !(req.user.id || req.user._id)) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      unique_id: user.unique_id,
      location: user.location,
      is_admin: user.is_admin,
      membershipActive: user.membershipActive,
      membershipPlan: user.membershipPlan,
      membershipExpiry: user.membershipExpiry
    });
  } catch (err) {
    console.error('Error fetching auth profile:', err);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;
