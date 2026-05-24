/**
 * retryFetch.js
 * Wraps an async fetch function with retry logic and exponential backoff.
 */

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 500;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/**
 * Determines whether an error or response status is worth retrying.
 * @param {Error|null} err
 * @param {number|null} statusCode
 * @returns {boolean}
 */
function isRetryable(err, statusCode = null) {
  if (err && err.code && ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'].includes(err.code)) {
    return true;
  }
  if (statusCode !== null && RETRYABLE_STATUS_CODES.has(statusCode)) {
    return true;
  }
  return false;
}

/**
 * Calculates exponential backoff delay with optional jitter.
 * @param {number} attempt  - zero-based attempt index
 * @param {number} baseMs   - base delay in milliseconds
 * @returns {number}
 */
function backoffDelay(attempt, baseMs = DEFAULT_BASE_DELAY_MS) {
  const exp = Math.min(attempt, 6); // cap exponent to avoid huge waits
  const delay = baseMs * Math.pow(2, exp);
  const jitter = Math.random() * baseMs;
  return Math.floor(delay + jitter);
}

/**
 * Retries an async function up to maxRetries times using exponential backoff.
 * @param {() => Promise<any>} fn         - async function to execute
 * @param {object}             [options]
 * @param {number}             [options.maxRetries=3]
 * @param {number}             [options.baseDelayMs=500]
 * @param {(ms: number) => Promise<void>} [options.sleep]  - injectable sleep for testing
 * @returns {Promise<any>}
 */
async function retryFetch(fn, options = {}) {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const sleep = options.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (err) {
      lastError = err;
      const statusCode = err.statusCode ?? null;

      if (attempt < maxRetries && isRetryable(err, statusCode)) {
        const delay = backoffDelay(attempt, baseDelayMs);
        await sleep(delay);
      } else {
        break;
      }
    }
  }

  throw lastError;
}

module.exports = { retryFetch, isRetryable, backoffDelay };
