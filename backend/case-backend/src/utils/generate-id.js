const { randomUUID } = require('crypto');

function generateUniqueIdWithPrefix(prefix) {
  const uuid = randomUUID().replace(/-/g, ''); // Remove dashes
  return prefix + uuid.substring(0, 12); // Take first 12 characters
}

module.exports = { generateUniqueIdWithPrefix }