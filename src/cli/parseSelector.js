/**
 * Utilities for parsing and validating CSS selectors used to scope page diffing.
 * A selector can be provided when adding a watch entry to limit change detection
 * to a specific part of the page (e.g. "#content", ".main-article").
 */

/**
 * Validates a CSS selector string.
 * Returns null if the selector is valid, or an error message string if invalid.
 *
 * @param {string} selector
 * @returns {string|null}
 */
function validateSelector(selector) {
  if (typeof selector !== 'string') {
    return 'Selector must be a string';
  }

  const trimmed = selector.trim();

  if (trimmed.length === 0) {
    return 'Selector must not be empty';
  }

  if (trimmed.length > 256) {
    return 'Selector must not exceed 256 characters';
  }

  // Basic sanity check — disallow raw script/style tag selectors
  const blocked = /^(script|style)(\s*[,{>~+]|$)/i;
  if (blocked.test(trimmed)) {
    return `Selector targeting "${trimmed.split(/\s/)[0]}" elements is not allowed`;
  }

  return null;
}

/**
 * Parses a raw selector string supplied by the user.
 * Returns an object with { selector, error } where error is null on success.
 *
 * @param {string|undefined} raw
 * @returns {{ selector: string|null, error: string|null }}
 */
function parseSelector(raw) {
  if (raw === undefined || raw === null || raw === '') {
    return { selector: null, error: null };
  }

  const error = validateSelector(raw);
  if (error) {
    return { selector: null, error };
  }

  return { selector: raw.trim(), error: null };
}

/**
 * Formats a selector for display in CLI output.
 *
 * @param {string|null|undefined} selector
 * @returns {string}
 */
function formatSelector(selector) {
  if (!selector) return '(whole page)';
  return `"${selector}"`;
}

module.exports = { parseSelector, validateSelector, formatSelector };
