const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth(['user', 'owner', 'admin']), getUserProfile);

// /api/auth/me - lightweight auth probe
// - Always returns 200
// - { user: null } when not authenticated
// - { user } when authenticated
router.get("/me", async (req, res) => {
  try {
    if (!req.user && !(req.session && req.session.user)) {
      return res.status(200).json({ user: null });
    }

    // Prefer user from decoded JWT or session
    let u = req.user || (req.session && req.session.user);

    // If minimal payload, hydrate from DB
    if (!u.email || !u.role || !u.unique_id) {
      const id = u._id || u.id;
      if (!id) {
        return res.status(200).json({ user: null });
      }

      const dbUser = await User.findById(id).select("_id email role public_id unique_id is_admin");
      if (!dbUser) {
        return res.status(200).json({ user: null });
      }
      u = dbUser;
    }

    return res.status(200).json({
      user: {
        _id: u._id,
        email: u.email,
        role: u.role,
        public_id: u.public_id,
        unique_id: u.unique_id,
        is_admin: u.is_admin || u.role === 'admin',
      },
    });
  } catch (err) {
    console.error("Error in /api/auth/me:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

module.exports = router;
