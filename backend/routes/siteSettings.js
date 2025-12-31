// backend/routes/siteSettings.js
const express = require("express");
const router = express.Router();
const SiteSettings = require("../models/SiteSettings");

// GET /api/site-settings - Get site settings from DB or fall back to env
router.get("/", async (req, res) => {
  try {
    const settings = {};

    // Try to fetch from database
    try {
      const dbSettings = await SiteSettings.find({}).lean();
      dbSettings.forEach((item) => {
        let value = item.value;
        // Try to parse booleans
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        // Try to parse numbers
        const num = Number(value);
        if (!Number.isNaN(num) && String(num) === item.value) {
          value = num;
        }
        settings[item.key] = value;
      });
    } catch (dbErr) {
      // If collection doesn't exist or other DB error, continue with env fallback
      console.warn('Could not fetch site settings from DB, using env fallback:', dbErr.message);
    }

    // Fallback to environment variables
    settings.listings_enabled = settings.listings_enabled ?? (process.env.LISTINGS_ENABLED === 'true');

    res.set('Vary', 'Authorization');
    res.json(settings);
  } catch (err) {
    console.error('Error fetching site settings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

