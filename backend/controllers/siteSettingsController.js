// backend/controllers/siteSettingsController.js
const { getSiteSetting, isListingsEnabled, setSiteSetting } = require('../utils/siteSettings');

/**
 * GET /api/site-settings
 * Get all site settings (or specific key)
 */
const getSettings = async (req, res) => {
  try {
    const { key } = req.query;
    if (key) {
      const value = await getSiteSetting(key);
      return res.json({ [key]: value });
    }
    // Return common settings
    const listingsEnabled = await isListingsEnabled();
    res.json({
      listings_enabled: listingsEnabled
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/site-settings/:key
 * Update a site setting (admin only)
 */
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value required' });
    }
    
    await setSiteSetting(key, value);
    res.json({ success: true, [key]: value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSettings,
  updateSetting
};

