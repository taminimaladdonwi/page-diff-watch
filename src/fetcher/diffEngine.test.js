import { describe, it, expect } from 'vitest';
import { computeDiff, hasChanged, summarizeDiff } from './diffEngine.js';

describe('computeDiff', () => {
  it('returns zero counts for identical content', () => {
    const result = computeDiff('hello\nworld\n', 'hello\nworld\n');
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
    expect(result.changes).toHaveLength(0);
  });

  it('detects added lines', () => {
    const result = computeDiff('line1\n', 'line1\nline2\n');
    expect(result.added).toBeGreaterThan(0);
    expect(result.removed).toBe(0);
  });

  it('detects removed lines', () => {
    const result = computeDiff('line1\nline2\n', 'line1\n');
    expect(result.removed).toBeGreaterThan(0);
    expect(result.added).toBe(0);
  });

  it('includes change type in each change entry', () => {
    const result = computeDiff('old\n', 'new\n');
    const types = result.changes.map((c) => c.type);
    expect(types).toContain('added');
    expect(types).toContain('removed');
  });

  it('handles empty old content gracefully', () => {
    const result = computeDiff('', 'new line\n');
    expect(result.added).toBeGreaterThan(0);
  });
});

describe('hasChanged', () => {
  it('returns false for identical strings', () => {
    expect(hasChanged('same', 'same')).toBe(false);
  });

  it('returns true when content differs', () => {
    expect(hasChanged('old content', 'new content')).toBe(true);
  });

  it('returns true when new content is empty', () => {
    expect(hasChanged('something', '')).toBe(true);
  });
});

describe('summarizeDiff', () => {
  it('formats added and removed lines', () => {
    expect(summarizeDiff({ added: 3, removed: 1 })).toBe('+3 lines, -1 line');
  });

  it('handles singular line count', () => {
    expect(summarizeDiff({ added: 1, removed: 0 })).toBe('+1 line');
  });

  it('returns no changes when both are zero', () => {
    expect(summarizeDiff({ added: 0, removed: 0 })).toBe('no changes');
  });
});
