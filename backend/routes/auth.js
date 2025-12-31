const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { asHandler } = require("./_routeHelpers");

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

module.exports = router;
