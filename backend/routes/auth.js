const express = require("express");
const { registerUser, loginUser, getUserProfile, getMe } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth(['user', 'owner', 'admin']), getUserProfile);
router.get("/me", auth(['user', 'owner', 'admin']), getMe);

module.exports = router;
