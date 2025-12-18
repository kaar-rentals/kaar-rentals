const express = require("express");
const { registerUser, loginUser, getUserProfile, getMe } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth(['user', 'owner', 'admin']), getUserProfile);
// /me endpoint uses optional auth - returns { user: null } if not authenticated
router.get("/me", getMe);

module.exports = router;
