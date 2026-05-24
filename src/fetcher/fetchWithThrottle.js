/**
 * fetchWithThrottle.js
 * Wraps httpGet with requestThrottle acquire/release lifecycle.
 */

const { httpGet } = require('./fetchPage');
const throttle = require('./requestThrottle');
const { validateUrl, normalizeUrl } = require('./urlValidator');

/**
 * Fetches a URL with concurrency and domain-delay throttling applied.
 * @param {string} url
 * @param {object} [options]
 * @param {object} [options.headers]
 * @returns {Promise<{status: number, body: string, headers: object}>}
 */
async function fetchWithThrottle(url, options = {}) {
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(`Invalid URL: ${validation.reason}`);
  }

  const normalized = normalizeUrl(url);

  await throttle.acquire(normalized);
  try {
    const result = await httpGet(normalized, options);
    return result;
  } finally {
    throttle.release();
  }
}

/**
 * Fetches multiple URLs sequentially with throttling.
 * @param {string[]} urls
 * @param {object} [options]
 * @returns {Promise<Array<{url: string, result?: object, error?: string}>>}
 */
async function fetchAll(urls, options = {}) {
  const results = [];
  for (const url of urls) {
    try {
      const result = await fetchWithThrottle(url, options);
      results.push({ url, result });
    } catch (err) {
      results.push({ url, error: err.message });
    }
  }
  return results;
}

module.exports = { fetchWithThrottle, fetchAll };
