/**
 * formatTable.js
 * Formats watchlist entries as a CLI-friendly table string.
 */

/**
 * Pads a string to a given length.
 * @param {string} str
 * @param {number} len
 * @returns {string}
 */
function pad(str, len) {
  const s = String(str ?? '');
  return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length);
}

/**
 * Truncates a string to maxLen, appending '…' if needed.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
function truncate(str, maxLen) {
  const s = String(str ?? '');
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '\u2026' : s;
}

/**
 * Formats an array of watchlist entry objects into a table string.
 * @param {Array<{id: string, url: string, interval: number, selector?: string, label?: string}>} entries
 * @returns {string}
 */
function formatTable(entries) {
  if (!entries || entries.length === 0) {
    return 'No entries in watchlist.';
  }

  const COL = { id: 8, label: 16, url: 40, interval: 10, selector: 20 };

  const header =
    pad('ID', COL.id) + '  ' +
    pad('Label', COL.label) + '  ' +
    pad('URL', COL.url) + '  ' +
    pad('Interval', COL.interval) + '  ' +
    pad('Selector', COL.selector);

  const divider = '-'.repeat(
    COL.id + COL.label + COL.url + COL.interval + COL.selector + 8
  );

  const rows = entries.map((entry) => {
    return (
      pad(truncate(entry.id, COL.id), COL.id) + '  ' +
      pad(truncate(entry.label ?? '—', COL.label), COL.label) + '  ' +
      pad(truncate(entry.url, COL.url), COL.url) + '  ' +
      pad(truncate(String(entry.interval) + 's', COL.interval), COL.interval) + '  ' +
      pad(truncate(entry.selector ?? '—', COL.selector), COL.selector)
    );
  });

  return [header, divider, ...rows].join('\n');
}

module.exports = { formatTable, pad, truncate };
