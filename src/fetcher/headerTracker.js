/**
 * headerTracker.js
 * Tracks and compares HTTP response headers across fetches.
 * Useful for detecting Last-Modified / ETag changes before full content fetch.
 */

const store = new Map();

/**
 * Returns the headers stored for a given URL, or null if not tracked.
 * @param {string} url
 * @returns {object|null}
 */
function getHeaders(url) {
  return store.has(url) ? { ...store.get(url) } : null;
}

/**
 * Stores headers for a given URL.
 * @param {string} url
 * @param {object} headers - plain object of header key/value pairs
 */
function setHeaders(url, headers) {
  if (!url || typeof headers !== 'object' || headers === null) {
    throw new Error('headerTracker.setHeaders: invalid arguments');
  }
  store.set(url, { ...headers });
}

/**
 * Compares stored headers with new headers for a URL.
 * Returns an object describing which relevant headers changed.
 * @param {string} url
 * @param {object} newHeaders
 * @returns {{ changed: boolean, details: object }}
 */
function compareHeaders(url, newHeaders) {
  const WATCHED_HEADERS = ['etag', 'last-modified', 'content-length', 'content-type'];
  const prev = store.get(url);

  if (!prev) {
    return { changed: false, details: {} };
  }

  const details = {};
  let changed = false;

  for (const key of WATCHED_HEADERS) {
    const oldVal = prev[key] ?? null;
    const newVal = newHeaders[key] ?? null;
    if (oldVal !== newVal) {
      details[key] = { from: oldVal, to: newVal };
      changed = true;
    }
  }

  return { changed, details };
}

/**
 * Removes stored headers for a URL.
 * @param {string} url
 */
function removeHeaders(url) {
  store.delete(url);
}

/**
 * Clears all stored headers.
 */
function clearAll() {
  store.clear();
}

module.exports = { getHeaders, setHeaders, compareHeaders, removeHeaders, clearAll };
