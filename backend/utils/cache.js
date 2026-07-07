const NodeCache = require('node-cache');
const crypto = require('crypto');

// TTL of 1 hour: identical (topic + transcript) submissions within that
// window are served from cache instead of re-calling the AI provider.
// In production this should be Redis so it's shared across instances.
const cache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 120 });

const makeKey = (topic, transcript) => {
  const hash = crypto
    .createHash('sha256')
    .update(`${topic.trim().toLowerCase()}::${transcript.trim().toLowerCase()}`)
    .digest('hex');
  return `eval:${hash}`;
};

module.exports = { cache, makeKey };
