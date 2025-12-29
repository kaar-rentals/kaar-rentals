// backend/routes/siteSettings.js
const express = require('express');
const router = express.Router();
const { getSettings, updateSetting } = require('../controllers/siteSettingsController');
const auth = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/authMiddleware');

// GET /api/site-settings - Public endpoint to get settings
router.get('/', getSettings);

// PUT /api/site-settings/:key - Admin only
router.put('/:key', auth(['admin']), isAdmin, updateSetting);

module.exports = router;

