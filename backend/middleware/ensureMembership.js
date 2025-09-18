// backend/middleware/ensureMembership.js
const User = require('../models/User');

module.exports = async function ensureMembership(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // freshest record
    const fresh = await User.findById(user._id).select('membershipActive membershipExpiry');
    const now = new Date();
    if (fresh && fresh.membershipActive && (!fresh.membershipExpiry || fresh.membershipExpiry > now)) {
      return next();
    }
    return res.status(403).json({ error: 'Active membership required to post a car' });
  } catch (err) {
    next(err);
  }
};
