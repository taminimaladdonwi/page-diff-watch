/**
 * cookieJar.js
 * Manages per-domain cookies for authenticated page fetching.
 */

'use strict';

const store = new Map();

/**
 * Parse a Set-Cookie header value into a key/value pair.
 * @param {string} header
 * @returns {{ name: string, value: string } | null}
 */
function parseCookie(header) {
  if (!header || typeof header !== 'string') return null;
  const [pair] = header.split(';');
  const eqIdx = pair.indexOf('=');
  if (eqIdx === -1) return null;
  const name = pair.slice(0, eqIdx).trim();
  const value = pair.slice(eqIdx + 1).trim();
  if (!name) return null;
  return { name, value };
}

/**
 * Store cookies for a given domain from Set-Cookie headers.
 * @param {string} domain
 * @param {string | string[]} headers
 */
function setCookies(domain, headers) {
  if (!domain || !headers) return;
  const list = Array.isArray(headers) ? headers : [headers];
  if (!store.has(domain)) store.set(domain, new Map());
  const jar = store.get(domain);
  for (const header of list) {
    const cookie = parseCookie(header);
    if (cookie) jar.set(cookie.name, cookie.value);
  }
}

/**
 * Get the Cookie header string for a given domain.
 * @param {string} domain
 * @returns {string}
 */
function getCookieHeader(domain) {
  if (!domain || !store.has(domain)) return '';
  const jar = store.get(domain);
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

/**
 * Remove all cookies for a domain.
 * @param {string} domain
 */
function clearDomain(domain) {
  store.delete(domain);
}

/**
 * Remove all cookies across all domains.
 */
function clearAll() {
  store.clear();
}

/**
 * Return the number of cookies stored for a domain.
 * @param {string} domain
 * @returns {number}
 */
function count(domain) {
  if (!store.has(domain)) return 0;
  return store.get(domain).size;
}

module.exports = { parseCookie, setCookies, getCookieHeader, clearDomain, clearAll, count };
