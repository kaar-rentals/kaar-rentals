const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Check Authorization header first
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token = null;
  
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  
  // Also check cookies if token not in header
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  // If no token, set req.user to null and continue (don't crash)
  if (!token) {
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure req.user has id, is_admin, unique_id
    req.user = {
      id: decoded.id || decoded._id,
      _id: decoded.id || decoded._id,
      is_admin: decoded.is_admin || false,
      unique_id: decoded.unique_id || null
    };
  } catch (err) {
    // invalid token -> set req.user to null and continue
    req.user = null;
  }
  next();
};


