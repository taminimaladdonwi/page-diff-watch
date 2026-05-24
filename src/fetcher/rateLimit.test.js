const { canFetch, recordFetch, msUntilNextFetch, resetUrl, resetAll, DEFAULT_MIN_DELAY_MS } = require('./rateLimit');

beforeEach(() => {
  resetAll();
});

describe('canFetch', () => {
  it('returns true for a URL never fetched', () => {
    expect(canFetch('https://example.com')).toBe(true);
  });

  it('returns false immediately after recordFetch', () => {
    recordFetch('https://example.com');
    expect(canFetch('https://example.com')).toBe(false);
  });

  it('returns true after the delay has elapsed', () => {
    recordFetch('https://example.com');
    // Use a tiny delay so the test doesn't actually wait
    expect(canFetch('https://example.com', 0)).toBe(true);
  });

  it('respects custom minDelayMs', () => {
    recordFetch('https://example.com');
    expect(canFetch('https://example.com', 99999)).toBe(false);
  });
});

describe('msUntilNextFetch', () => {
  it('returns 0 for a URL never fetched', () => {
    expect(msUntilNextFetch('https://example.com')).toBe(0);
  });

  it('returns a positive number immediately after recordFetch', () => {
    recordFetch('https://example.com');
    const ms = msUntilNextFetch('https://example.com');
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(DEFAULT_MIN_DELAY_MS);
  });

  it('returns 0 when delay has passed', () => {
    recordFetch('https://example.com');
    expect(msUntilNextFetch('https://example.com', 0)).toBe(0);
  });
});

describe('resetUrl', () => {
  it('allows fetching again after reset', () => {
    recordFetch('https://example.com');
    resetUrl('https://example.com');
    expect(canFetch('https://example.com')).toBe(true);
  });

  it('does not affect other URLs', () => {
    recordFetch('https://a.com');
    recordFetch('https://b.com');
    resetUrl('https://a.com');
    expect(canFetch('https://a.com')).toBe(true);
    expect(canFetch('https://b.com')).toBe(false);
  });
});

describe('resetAll', () => {
  it('clears all tracked URLs', () => {
    recordFetch('https://a.com');
    recordFetch('https://b.com');
    resetAll();
    expect(canFetch('https://a.com')).toBe(true);
    expect(canFetch('https://b.com')).toBe(true);
  });
});
