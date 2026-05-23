/**
 * Parses a human-readable interval string into milliseconds.
 * Supports formats like: 30s, 5m, 2h, 1d
 */

const UNITS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const MIN_INTERVAL_MS = 10 * 1000; // 10 seconds minimum

/**
 * Parse interval string to milliseconds.
 * @param {string} input - e.g. "30s", "5m", "2h"
 * @returns {number} milliseconds
 * @throws {Error} if format is invalid or value is too small
 */
function parseInterval(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('Interval must be a non-empty string.');
  }

  const match = input.trim().match(/^(\d+(?:\.\d+)?)([smhd])$/);
  if (!match) {
    throw new Error(
      `Invalid interval format: "${input}". Use formats like 30s, 5m, 2h, 1d.`
    );
  }

  const value = parseFloat(match[1]);
  const unit = match[2];

  if (value <= 0) {
    throw new Error('Interval value must be greater than zero.');
  }

  const ms = value * UNITS[unit];

  if (ms < MIN_INTERVAL_MS) {
    throw new Error(
      `Interval too short: minimum is ${formatInterval(MIN_INTERVAL_MS)}.`
    );
  }

  return ms;
}

/**
 * Format milliseconds back to a human-readable string.
 * @param {number} ms
 * @returns {string}
 */
function formatInterval(ms) {
  if (ms >= UNITS.d && ms % UNITS.d === 0) return `${ms / UNITS.d}d`;
  if (ms >= UNITS.h && ms % UNITS.h === 0) return `${ms / UNITS.h}h`;
  if (ms >= UNITS.m && ms % UNITS.m === 0) return `${ms / UNITS.m}m`;
  return `${Math.round(ms / UNITS.s)}s`;
}

module.exports = { parseInterval, formatInterval };
