// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email role unique_id is_admin');

      if (!user) return res.status(401).json({ error: "User not found" });
      if (roles.length && !roles.includes(user.role))
        return res.status(403).json({ error: "Forbidden" });

      req.user = {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        unique_id: user.unique_id,
        is_admin: user.is_admin || user.role === 'admin'
      };
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };
};

// Admin-only middleware
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!req.user.is_admin && req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = auth;
module.exports.isAdmin = isAdmin;
