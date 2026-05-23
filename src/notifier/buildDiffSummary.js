/**
 * Builds a short human-readable summary of the difference between
 * two plain-text content strings.
 *
 * @param {string} oldContent
 * @param {string} newContent
 * @returns {string} A short summary suitable for a notification message.
 */
export function buildDiffSummary(oldContent, newContent) {
  if (typeof oldContent !== 'string' || typeof newContent !== 'string') {
    throw new TypeError('buildDiffSummary expects two strings');
  }

  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  const added = newLines.filter((l) => l.trim() && !oldSet.has(l));
  const removed = oldLines.filter((l) => l.trim() && !newSet.has(l));

  const parts = [];

  if (added.length > 0) {
    const preview = truncate(added[0].trim(), 60);
    parts.push(`+${added.length} line${added.length > 1 ? 's' : ''} (e.g. "${preview}")`);
  }

  if (removed.length > 0) {
    const preview = truncate(removed[0].trim(), 60);
    parts.push(`-${removed.length} line${removed.length > 1 ? 's' : ''} (e.g. "${preview}")`);
  }

  if (parts.length === 0) {
    // Content changed but line-diff couldn't pinpoint it (e.g. whitespace)
    return 'Content updated (minor changes detected).';
  }

  return parts.join('; ');
}

function truncate(str, maxLen) {
  if (!str) return '';
  return str.length <= maxLen ? str : str.slice(0, maxLen - 1) + '…';
}
