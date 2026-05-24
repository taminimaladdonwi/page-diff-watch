/**
 * pageFilter.js
 * Applies include/exclude text filters to extracted page content.
 */

/**
 * Filters lines from content based on include/exclude patterns.
 * @param {string} content - Raw text content
 * @param {object} options
 * @param {string[]} [options.include] - Only keep lines matching any of these patterns
 * @param {string[]} [options.exclude] - Remove lines matching any of these patterns
 * @returns {string} Filtered content
 */
function filterContent(content, { include = [], exclude = [] } = {}) {
  if (!content || typeof content !== 'string') return '';

  let lines = content.split('\n');

  if (include.length > 0) {
    lines = lines.filter(line =>
      include.some(pattern => matchesPattern(line, pattern))
    );
  }

  if (exclude.length > 0) {
    lines = lines.filter(line =>
      !exclude.some(pattern => matchesPattern(line, pattern))
    );
  }

  return lines.join('\n');
}

/**
 * Checks if a line matches a pattern (string substring or RegExp).
 * @param {string} line
 * @param {string|RegExp} pattern
 * @returns {boolean}
 */
function matchesPattern(line, pattern) {
  if (pattern instanceof RegExp) {
    return pattern.test(line);
  }
  return line.toLowerCase().includes(String(pattern).toLowerCase());
}

/**
 * Normalizes whitespace in content: trims lines and collapses blank lines.
 * @param {string} content
 * @returns {string}
 */
function normalizeContent(content) {
  if (!content || typeof content !== 'string') return '';
  return content
    .split('\n')
    .map(line => line.trim())
    .filter((line, i, arr) => line !== '' || (i > 0 && arr[i - 1] !== ''))
    .join('\n')
    .trim();
}

module.exports = { filterContent, matchesPattern, normalizeContent };
