const throttle = require('./requestThrottle');

beforeEach(() => {
  throttle.reset();
});

describe('configure', () => {
  it('sets maxConcurrent and domainDelayMs', () => {
    throttle.configure({ maxConcurrent: 5, domainDelayMs: 500 });
    const stats = throttle.getStats();
    expect(stats.maxConcurrent).toBe(5);
    expect(stats.domainDelayMs).toBe(500);
  });

  it('applies partial config', () => {
    throttle.configure({ maxConcurrent: 2 });
    const stats = throttle.getStats();
    expect(stats.maxConcurrent).toBe(2);
    expect(stats.domainDelayMs).toBe(1000);
  });
});

describe('isConcurrencyAvailable', () => {
  it('returns true when no active requests', () => {
    expect(throttle.isConcurrencyAvailable()).toBe(true);
  });

  it('returns false when at max concurrent', async () => {
    throttle.configure({ maxConcurrent: 1, domainDelayMs: 0 });
    await throttle.acquire('http://example.com/a');
    expect(throttle.isConcurrencyAvailable()).toBe(false);
    throttle.release();
  });
});

describe('acquire and release', () => {
  it('increments and decrements active count', async () => {
    throttle.configure({ domainDelayMs: 0 });
    await throttle.acquire('http://example.com/page');
    expect(throttle.getStats().active).toBe(1);
    throttle.release();
    expect(throttle.getStats().active).toBe(0);
  });

  it('does not go below zero on extra release', () => {
    throttle.release();
    expect(throttle.getStats().active).toBe(0);
  });
});

describe('msUntilAvailable', () => {
  it('returns 0 for unseen domain', () => {
    expect(throttle.msUntilAvailable('http://new.example.com')).toBe(0);
  });

  it('returns delay after recent acquire', async () => {
    throttle.configure({ domainDelayMs: 2000 });
    await throttle.acquire('http://slow.example.com');
    throttle.release();
    const ms = throttle.msUntilAvailable('http://slow.example.com');
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(2000);
  });
});

describe('getStats', () => {
  it('returns expected shape', () => {
    const stats = throttle.getStats();
    expect(stats).toHaveProperty('active');
    expect(stats).toHaveProperty('queued');
    expect(stats).toHaveProperty('maxConcurrent');
    expect(stats).toHaveProperty('domainDelayMs');
  });
});
