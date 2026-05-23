import { describe, it, expect } from 'vitest';
import { buildDiffSummary, truncate } from './buildDiffSummary.js';

describe('truncate', () => {
  it('returns the string unchanged if within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and appends ellipsis when over limit', () => {
    const result = truncate('hello world', 8);
    expect(result).toBe('hello wo…');
    expect(result.length).toBe(9);
  });

  it('handles exact limit without truncating', () => {
    expect(truncate('abcde', 5)).toBe('abcde');
  });
});

describe('buildDiffSummary', () => {
  it('includes the URL in the summary', () => {
    const summary = buildDiffSummary({
      url: 'https://example.com',
      oldContent: 'line1\n',
      newContent: 'line1\nline2\n',
    });
    expect(summary).toContain('example.com');
  });

  it('includes line change counts', () => {
    const summary = buildDiffSummary({
      url: 'https://example.com',
      oldContent: 'a\nb\n',
      newContent: 'a\nc\n',
    });
    expect(summary).toMatch(/\+\d+/);
  });

  it('returns a non-empty string', () => {
    const summary = buildDiffSummary({
      url: 'https://test.org',
      oldContent: '',
      newContent: 'new content\n',
    });
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(0);
  });

  it('respects max length constraint', () => {
    const longContent = Array.from({ length: 200 }, (_, i) => `line ${i}`).join('\n');
    const summary = buildDiffSummary({
      url: 'https://example.com',
      oldContent: '',
      newContent: longContent,
    });
    expect(summary.length).toBeLessThanOrEqual(256);
  });
});
