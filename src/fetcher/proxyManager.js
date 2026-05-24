/**
 * proxyManager.js
 * Manages a pool of proxy configurations for HTTP requests.
 * Supports rotation, health tracking, and fallback to direct connection.
 */

const proxies = [];
let currentIndex = 0;

/**
 * Add a proxy to the pool.
 * @param {string} url - Proxy URL e.g. 'http://host:port'
 * @param {object} [options]
 * @param {string} [options.username]
 * @param {string} [options.password]
 */
function addProxy(url, options = {}) {
  if (!url || typeof url !== 'string') {
    throw new Error('Proxy URL must be a non-empty string');
  }
  const existing = proxies.find(p => p.url === url);
  if (existing) return;
  proxies.push({
    url,
    username: options.username || null,
    password: options.password || null,
    failures: 0,
    disabled: false,
  });
}

/**
 * Remove a proxy from the pool by URL.
 * @param {string} url
 */
function removeProxy(url) {
  const idx = proxies.findIndex(p => p.url === url);
  if (idx !== -1) proxies.splice(idx, 1);
}

/**
 * Get the next available proxy using round-robin rotation.
 * Skips disabled proxies. Returns null if none available.
 * @returns {{ url: string, username: string|null, password: string|null } | null}
 */
function getNextProxy() {
  const available = proxies.filter(p => !p.disabled);
  if (available.length === 0) return null;
  const proxy = available[currentIndex % available.length];
  currentIndex = (currentIndex + 1) % available.length;
  return { url: proxy.url, username: proxy.username, password: proxy.password };
}

/**
 * Record a failure for a proxy URL.
 * Disables the proxy after 3 consecutive failures.
 * @param {string} url
 */
function recordFailure(url) {
  const proxy = proxies.find(p => p.url === url);
  if (!proxy) return;
  proxy.failures += 1;
  if (proxy.failures >= 3) {
    proxy.disabled = true;
  }
}

/**
 * Reset failure count and re-enable a proxy.
 * @param {string} url
 */
function resetProxy(url) {
  const proxy = proxies.find(p => p.url === url);
  if (!proxy) return;
  proxy.failures = 0;
  proxy.disabled = false;
}

/**
 * Clear all proxies from the pool.
 */
function clearAll() {
  proxies.length = 0;
  currentIndex = 0;
}

/**
 * Return a snapshot of the current proxy pool (for inspection/testing).
 */
function listProxies() {
  return proxies.map(p => ({ ...p }));
}

module.exports = { addProxy, removeProxy, getNextProxy, recordFailure, resetProxy, clearAll, listProxies };
