"use strict";

const { URL } = require("url");

const ALLOWED_PROTOCOLS = ["http:", "https:"];
const MAX_URL_LENGTH = 2048;

/**
 * Checks whether a given string is a structurally valid URL
 * with an allowed protocol.
 * @param {string} raw
 * @returns {{ valid: boolean, reason?: string, url?: URL }}
 */
function validateUrl(raw) {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { valid: false, reason: "URL must be a non-empty string" };
  }

  const trimmed = raw.trim();

  if (trimmed.length > MAX_URL_LENGTH) {
    return { valid: false, reason: `URL exceeds maximum length of ${MAX_URL_LENGTH} characters` };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: "URL is not well-formed" };
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return {
      valid: false,
      reason: `Protocol "${parsed.protocol}" is not allowed; use http or https`,
    };
  }

  if (!parsed.hostname || parsed.hostname.length === 0) {
    return { valid: false, reason: "URL must include a hostname" };
  }

  return { valid: true, url: parsed };
}

/**
 * Normalises a URL string: lowercases the scheme and host,
 * removes a trailing slash from the pathname when it is the only path segment,
 * and strips the default port for the protocol.
 * @param {string} raw
 * @returns {string}
 */
function normalizeUrl(raw) {
  const { valid, url } = validateUrl(raw);
  if (!valid) throw new Error(`Cannot normalise invalid URL: ${raw}`);

  // Remove default ports
  const defaultPorts = { "http:": "80", "https:": "443" };
  if (url.port === defaultPorts[url.protocol]) {
    url.port = "";
  }

  // Remove trailing slash when pathname is just "/"
  const pathname = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");

  return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}${pathname}${url.search}${url.hash}`;
}

module.exports = { validateUrl, normalizeUrl, ALLOWED_PROTOCOLS, MAX_URL_LENGTH };
