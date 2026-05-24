const { getHeaders, setHeaders, compareHeaders, removeHeaders, clearAll } = require('./headerTracker');

beforeEach(() => {
  clearAll();
});

describe('getHeaders', () => {
  test('returns null when URL not tracked', () => {
    expect(getHeaders('https://example.com')).toBeNull();
  });

  test('returns a copy of stored headers', () => {
    const h = { etag: '"abc123"', 'content-type': 'text/html' };
    setHeaders('https://example.com', h);
    const result = getHeaders('https://example.com');
    expect(result).toEqual(h);
    expect(result).not.toBe(h); // should be a copy
  });
});

describe('setHeaders', () => {
  test('stores headers for a URL', () => {
    setHeaders('https://example.com', { etag: '"v1"' });
    expect(getHeaders('https://example.com')).toEqual({ etag: '"v1"' });
  });

  test('throws on invalid arguments', () => {
    expect(() => setHeaders('', { etag: 'x' })).toThrow();
    expect(() => setHeaders('https://example.com', null)).toThrow();
  });

  test('overwrites previous headers', () => {
    setHeaders('https://example.com', { etag: '"v1"' });
    setHeaders('https://example.com', { etag: '"v2"' });
    expect(getHeaders('https://example.com').etag).toBe('"v2"');
  });
});

describe('compareHeaders', () => {
  test('returns changed: false when no previous headers stored', () => {
    const result = compareHeaders('https://example.com', { etag: '"abc"' });
    expect(result.changed).toBe(false);
    expect(result.details).toEqual({});
  });

  test('detects etag change', () => {
    setHeaders('https://example.com', { etag: '"v1"', 'last-modified': 'Mon, 01 Jan 2024 00:00:00 GMT' });
    const result = compareHeaders('https://example.com', { etag: '"v2"', 'last-modified': 'Mon, 01 Jan 2024 00:00:00 GMT' });
    expect(result.changed).toBe(true);
    expect(result.details.etag).toEqual({ from: '"v1"', to: '"v2"' });
    expect(result.details['last-modified']).toBeUndefined();
  });

  test('returns changed: false when watched headers are identical', () => {
    const h = { etag: '"same"', 'content-length': '1024' };
    setHeaders('https://example.com', h);
    const result = compareHeaders('https://example.com', h);
    expect(result.changed).toBe(false);
  });

  test('detects missing header as change', () => {
    setHeaders('https://example.com', { etag: '"v1"' });
    const result = compareHeaders('https://example.com', {});
    expect(result.changed).toBe(true);
    expect(result.details.etag).toEqual({ from: '"v1"', to: null });
  });
});

describe('removeHeaders', () => {
  test('removes headers for a URL', () => {
    setHeaders('https://example.com', { etag: '"v1"' });
    removeHeaders('https://example.com');
    expect(getHeaders('https://example.com')).toBeNull();
  });
});

describe('clearAll', () => {
  test('clears all tracked headers', () => {
    setHeaders('https://a.com', { etag: '"1"' });
    setHeaders('https://b.com', { etag: '"2"' });
    clearAll();
    expect(getHeaders('https://a.com')).toBeNull();
    expect(getHeaders('https://b.com')).toBeNull();
  });
});
