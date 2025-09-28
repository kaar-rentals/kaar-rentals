const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth(['user', 'owner', 'admin']), getUserProfile);

module.exports = router;
