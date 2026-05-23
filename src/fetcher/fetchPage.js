import fetch from 'node-fetch';
import crypto from 'crypto';

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Fetches the text content of a URL.
 * @param {string} url
 * @param {number} [timeoutMs]
 * @returns {Promise<string>}
 */
export async function fetchPageContent(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Computes a SHA-256 hash of the given text.
 * @param {string} text
 * @returns {string}
 */
export function hashContent(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Fetches a page and returns its content hash.
 * @param {string} url
 * @param {number} [timeoutMs]
 * @returns {Promise<{ hash: string, content: string }>}
 */
export async function fetchAndHash(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const content = await fetchPageContent(url, timeoutMs);
  const hash = hashContent(content);
  return { hash, content };
}
