const express = require("express");
const router = express.Router();
const SiteSettings = require("../models/SiteSettings");

router.get("/", async (req, res) => {
  try {
    const settings = {};

    try {
      const dbSettings = await SiteSettings.find({}).lean();
      dbSettings.forEach((item) => {
        let value = item.value;
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        const num = Number(value);
        if (!Number.isNaN(num) && String(num) === item.value) {
          value = num;
        }
        settings[item.key] = value;
      });
    } catch (dbErr) {
      console.warn('Could not fetch site settings from DB, using env fallback:', dbErr.message);
    }

    settings.listings_enabled = settings.listings_enabled ?? (process.env.LISTINGS_ENABLED === 'true');

    res.set('Vary', 'Authorization');
    res.json(settings);
  } catch (err) {
    console.error('Error fetching site settings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

