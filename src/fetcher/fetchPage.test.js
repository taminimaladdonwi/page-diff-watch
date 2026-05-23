import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashContent, fetchAndHash, fetchPageContent } from './fetchPage.js';

vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

import fetch from 'node-fetch';

describe('hashContent', () => {
  it('returns a 64-char hex string', () => {
    const hash = hashContent('hello world');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('returns the same hash for the same input', () => {
    expect(hashContent('abc')).toBe(hashContent('abc'));
  });

  it('returns different hashes for different inputs', () => {
    expect(hashContent('foo')).not.toBe(hashContent('bar'));
  });
});

describe('fetchPageContent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns text on success', async () => {
    fetch.mockResolvedValue({ ok: true, text: async () => '<html>hi</html>' });
    const result = await fetchPageContent('https://example.com');
    expect(result).toBe('<html>hi</html>');
  });

  it('throws on non-ok response', async () => {
    fetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchPageContent('https://example.com')).rejects.toThrow('HTTP 404');
  });
});

describe('fetchAndHash', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns hash and content', async () => {
    fetch.mockResolvedValue({ ok: true, text: async () => 'page content' });
    const { hash, content } = await fetchAndHash('https://example.com');
    expect(content).toBe('page content');
    expect(hash).toBe(hashContent('page content'));
  });
});
