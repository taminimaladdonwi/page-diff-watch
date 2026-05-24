/**
 * rateLimit.js
 * Controls fetch frequency to avoid hammering servers.
 * Tracks last-fetch timestamps per URL and enforces minimum delay.
 */

const DEFAULT_MIN_DELAY_MS = 2000;

/** @type {Map<string, number>} url -> last fetch timestamp */
const lastFetchMap = new Map();

/**
 * Returns true if enough time has passed since the last fetch for this URL.
 * @param {string} url
 * @param {number} minDelayMs
 * @returns {boolean}
 */
function canFetch(url, minDelayMs = DEFAULT_MIN_DELAY_MS) {
  const last = lastFetchMap.get(url);
  if (last === undefined) return true;
  return Date.now() - last >= minDelayMs;
}

/**
 * Records that a fetch just occurred for this URL.
 * @param {string} url
 */
function recordFetch(url) {
  lastFetchMap.set(url, Date.now());
}

/**
 * Returns the number of milliseconds to wait before the next allowed fetch.
 * Returns 0 if a fetch is already allowed.
 * @param {string} url
 * @param {number} minDelayMs
 * @returns {number}
 */
function msUntilNextFetch(url, minDelayMs = DEFAULT_MIN_DELAY_MS) {
  const last = lastFetchMap.get(url);
  if (last === undefined) return 0;
  const elapsed = Date.now() - last;
  return Math.max(0, minDelayMs - elapsed);
}

/**
 * Clears rate-limit state for a URL (useful for testing or manual resets).
 * @param {string} url
 */
function resetUrl(url) {
  lastFetchMap.delete(url);
}

/** Clears all rate-limit state. */
function resetAll() {
  lastFetchMap.clear();
}

module.exports = { canFetch, recordFetch, msUntilNextFetch, resetUrl, resetAll, DEFAULT_MIN_DELAY_MS };
