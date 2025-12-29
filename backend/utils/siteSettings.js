// backend/utils/siteSettings.js
const SiteSettings = require('../models/SiteSettings');

/**
 * Get a site setting value, with fallback to environment variable
 * @param {string} key - Setting key
 * @param {string} defaultValue - Default value if not found
 * @returns {Promise<string>}
 */
async function getSiteSetting(key, defaultValue = null) {
  try {
    const setting = await SiteSettings.findOne({ key });
    if (setting) {
      return setting.value;
    }
    // Fallback to environment variable
    const envKey = key.toUpperCase().replace(/-/g, '_');
    return process.env[envKey] || defaultValue;
  } catch (err) {
    console.error(`Error fetching site setting ${key}:`, err);
    // Fallback to environment variable on error
    const envKey = key.toUpperCase().replace(/-/g, '_');
    return process.env[envKey] || defaultValue;
  }
}

/**
 * Get listings_enabled setting as boolean
 * @returns {Promise<boolean>}
 */
async function isListingsEnabled() {
  const value = await getSiteSetting('listings_enabled', 'false');
  return value === 'true' || value === true;
}

/**
 * Set a site setting
 * @param {string} key - Setting key
 * @param {string} value - Setting value
 * @returns {Promise<void>}
 */
async function setSiteSetting(key, value) {
  try {
    await SiteSettings.findOneAndUpdate(
      { key },
      { key, value: String(value) },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`Error setting site setting ${key}:`, err);
    throw err;
  }
}

module.exports = {
  getSiteSetting,
  isListingsEnabled,
  setSiteSetting
};

