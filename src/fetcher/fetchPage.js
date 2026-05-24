/**
 * fetchPage.js
 * Fetches a web page with rate-limiting and returns its text content.
 * Computes a SHA-256 hash of the content for change detection.
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');
const { canFetch, recordFetch, msUntilNextFetch } = require('./rateLimit');

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Computes a SHA-256 hex digest of a string.
 * @param {string} content
 * @returns {string}
 */
function hashContent(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Performs a raw HTTP/HTTPS GET and resolves with the response body string.
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<string>}
 */
function httpGet(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: timeoutMs }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout fetching ${url}`)); });
    req.on('error', reject);
  });
}

/**
 * Fetches a URL, respecting rate limits.
 * @param {string} url
 * @param {{ minDelayMs?: number, timeoutMs?: number }} [opts]
 * @returns {Promise<{ body: string, hash: string, fetchedAt: number }>}
 */
async function fetchPage(url, opts = {}) {
  const { minDelayMs, timeoutMs } = opts;
  const wait = msUntilNextFetch(url, minDelayMs);
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  recordFetch(url);
  const body = await httpGet(url, timeoutMs);
  return { body, hash: hashContent(body), fetchedAt: Date.now() };
}

module.exports = { fetchPage, hashContent, httpGet };
