// backend/utils/generateUniqueId.js
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

module.exports = function generateUniqueId() {
  return nanoid();
};

