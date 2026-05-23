import { diffLines } from 'diff';

/**
 * Computes a structured diff between two text contents.
 * @param {string} oldContent
 * @param {string} newContent
 * @returns {{ added: number, removed: number, changes: Array }}
 */
export function computeDiff(oldContent, newContent) {
  const parts = diffLines(oldContent || '', newContent || '');

  const changes = parts
    .filter((part) => part.added || part.removed)
    .map((part) => ({
      type: part.added ? 'added' : 'removed',
      value: part.value.trimEnd(),
      count: part.count ?? 1,
    }));

  const added = changes
    .filter((c) => c.type === 'added')
    .reduce((sum, c) => sum + c.count, 0);

  const removed = changes
    .filter((c) => c.type === 'removed')
    .reduce((sum, c) => sum + c.count, 0);

  return { added, removed, changes };
}

/**
 * Returns true if the two contents differ meaningfully.
 * @param {string} oldContent
 * @param {string} newContent
 * @returns {boolean}
 */
export function hasChanged(oldContent, newContent) {
  if (oldContent === newContent) return false;
  const { changes } = computeDiff(oldContent, newContent);
  return changes.length > 0;
}

/**
 * Produces a short human-readable summary of a diff result.
 * @param {{ added: number, removed: number }} diffResult
 * @returns {string}
 */
export function summarizeDiff({ added, removed }) {
  const parts = [];
  if (added > 0) parts.push(`+${added} line${added !== 1 ? 's' : ''}`);
  if (removed > 0) parts.push(`-${removed} line${removed !== 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(', ') : 'no changes';
}
