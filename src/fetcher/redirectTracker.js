/**
 * redirectTracker.js
 * Tracks and resolves HTTP redirects for monitored URLs,
 * storing the final resolved URL to detect redirect changes.
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const MAX_REDIRECTS = 10;

/**
 * Follow redirects for a given URL and return the final URL.
 * @param {string} url
 * @param {number} [maxRedirects]
 * @returns {Promise<{ finalUrl: string, redirectChain: string[], statusCode: number }>}
 */
function resolveRedirects(url, maxRedirects = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const chain = [];

    function follow(currentUrl, remaining) {
      if (remaining <= 0) {
        return reject(new Error(`Too many redirects for ${url}`));
      }

      let parsed;
      try {
        parsed = new URL(currentUrl);
      } catch {
        return reject(new Error(`Invalid URL: ${currentUrl}`));
      }

      const lib = parsed.protocol === 'https:' ? https : http;

      const req = lib.get(currentUrl, { timeout: 8000 }, (res) => {
        const { statusCode, headers } = res;
        res.resume();

        if (statusCode >= 300 && statusCode < 400 && headers.location) {
          const next = new URL(headers.location, currentUrl).toString();
          chain.push(currentUrl);
          follow(next, remaining - 1);
        } else {
          resolve({ finalUrl: currentUrl, redirectChain: chain, statusCode });
        }
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timed out for ${currentUrl}`));
      });
    }

    follow(url, maxRedirects);
  });
}

/**
 * Check whether the final URL differs from the original.
 * @param {string} originalUrl
 * @returns {Promise<{ changed: boolean, finalUrl: string, redirectChain: string[] }>}
 */
async function checkRedirectChanged(originalUrl) {
  const result = await resolveRedirects(originalUrl);
  return {
    changed: result.finalUrl !== originalUrl,
    finalUrl: result.finalUrl,
    redirectChain: result.redirectChain,
  };
}

module.exports = { resolveRedirects, checkRedirectChanged, MAX_REDIRECTS };
