/**
 * authManager.js
 * Manages per-domain authentication credentials for HTTP requests.
 * Supports Basic Auth and Bearer token strategies.
 */

'use strict';

const credentials = new Map();

/**
 * Supported auth types
 */
const AUTH_TYPES = { BASIC: 'basic', BEARER: 'bearer' };

/**
 * Store credentials for a domain.
 * @param {string} domain - e.g. 'example.com'
 * @param {{ type: string, username?: string, password?: string, token?: string }} auth
 */
function setCredentials(domain, auth) {
  if (!domain || typeof domain !== 'string') throw new Error('Invalid domain');
  if (!auth || !AUTH_TYPES[auth.type?.toUpperCase()]) {
    throw new Error(`Unsupported auth type: ${auth?.type}`);
  }
  if (auth.type === AUTH_TYPES.BASIC && (!auth.username || !auth.password)) {
    throw new Error('Basic auth requires username and password');
  }
  if (auth.type === AUTH_TYPES.BEARER && !auth.token) {
    throw new Error('Bearer auth requires a token');
  }
  credentials.set(domain, { ...auth });
}

/**
 * Retrieve credentials for a domain.
 * @param {string} domain
 * @returns {{ type: string, username?: string, password?: string, token?: string } | null}
 */
function getCredentials(domain) {
  return credentials.get(domain) ?? null;
}

/**
 * Build the Authorization header value for a domain.
 * @param {string} domain
 * @returns {string | null}
 */
function buildAuthHeader(domain) {
  const auth = getCredentials(domain);
  if (!auth) return null;
  if (auth.type === AUTH_TYPES.BASIC) {
    const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
    return `Basic ${encoded}`;
  }
  if (auth.type === AUTH_TYPES.BEARER) {
    return `Bearer ${auth.token}`;
  }
  return null;
}

/**
 * Remove credentials for a domain.
 * @param {string} domain
 */
function removeCredentials(domain) {
  credentials.delete(domain);
}

/**
 * Clear all stored credentials.
 */
function clearAll() {
  credentials.clear();
}

module.exports = { AUTH_TYPES, setCredentials, getCredentials, buildAuthHeader, removeCredentials, clearAll };
