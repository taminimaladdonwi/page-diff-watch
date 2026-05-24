/**
 * contentCache.js
 * In-memory LRU-style cache for recently fetched page content.
 * Prevents redundant network requests within a short time window.
 */

const DEFAULT_TTL_MS = 30_000; // 30 seconds
const DEFAULT_MAX_SIZE = 50;

let cache = new Map();
let maxSize = DEFAULT_MAX_SIZE;
let ttlMs = DEFAULT_TTL_MS;

/**
 * Configure cache settings.
 * @param {{ ttlMs?: number, maxSize?: number }} options
 */
function configure(options = {}) {
  if (options.ttlMs !== undefined) ttlMs = options.ttlMs;
  if (options.maxSize !== undefined) maxSize = options.maxSize;
}

/**
 * Get cached content for a URL, or undefined if missing/expired.
 * @param {string} url
 * @returns {string|undefined}
 */
function get(url) {
  const entry = cache.get(url);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(url);
    return undefined;
  }
  // Refresh position (LRU)
  cache.delete(url);
  cache.set(url, entry);
  return entry.content;
}

/**
 * Store content for a URL in the cache.
 * @param {string} url
 * @param {string} content
 */
function set(url, content) {
  if (cache.has(url)) cache.delete(url);
  if (cache.size >= maxSize) {
    // Evict oldest entry
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(url, { content, expiresAt: Date.now() + ttlMs });
}

/**
 * Invalidate a specific URL's cache entry.
 * @param {string} url
 */
function invalidate(url) {
  cache.delete(url);
}

/**
 * Clear all cached entries.
 */
function clear() {
  cache = new Map();
}

/**
 * Return current cache size.
 * @returns {number}
 */
function size() {
  return cache.size;
}

module.exports = { configure, get, set, invalidate, clear, size };
