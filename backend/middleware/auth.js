const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Optional auth middleware - populates req.user if token is valid, otherwise req.user is null
module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch full user from DB to get unique_id and is_admin
    const user = await User.findById(decoded.id).select('_id name email role unique_id is_admin');
    if (user) {
      req.user = {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        unique_id: user.unique_id,
        is_admin: user.is_admin || user.role === 'admin'
      };
    } else {
      req.user = null;
    }
  } catch (err) {
    // invalid token -> set req.user to null
    req.user = null;
  }
  next();
};


