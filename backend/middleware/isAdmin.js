// middleware/isAdmin.js
module.exports = function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Check if user has is_admin flag or role is admin
  const isAdminUser = req.user.is_admin === true || req.user.role === 'admin';
  
  if (!isAdminUser) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  return next();
};

