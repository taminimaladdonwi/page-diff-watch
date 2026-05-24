const { retryFetch, isRetryable, backoffDelay } = require('./retryFetch');

const noSleep = () => Promise.resolve();

describe('isRetryable', () => {
  test('returns true for retryable network error codes', () => {
    expect(isRetryable({ code: 'ECONNRESET' })).toBe(true);
    expect(isRetryable({ code: 'ETIMEDOUT' })).toBe(true);
    expect(isRetryable({ code: 'ENOTFOUND' })).toBe(true);
  });

  test('returns true for retryable HTTP status codes', () => {
    expect(isRetryable(null, 429)).toBe(true);
    expect(isRetryable(null, 503)).toBe(true);
    expect(isRetryable(null, 500)).toBe(true);
  });

  test('returns false for non-retryable errors', () => {
    expect(isRetryable({ code: 'EACCES' })).toBe(false);
    expect(isRetryable(null, 404)).toBe(false);
    expect(isRetryable(null, 400)).toBe(false);
  });
});

describe('backoffDelay', () => {
  test('increases with attempt number', () => {
    const d0 = backoffDelay(0, 100);
    const d1 = backoffDelay(1, 100);
    const d2 = backoffDelay(2, 100);
    // With jitter the ranges overlap slightly, but median should grow
    expect(d1).toBeGreaterThanOrEqual(100);
    expect(d2).toBeGreaterThanOrEqual(200);
    expect(typeof d0).toBe('number');
  });
});

describe('retryFetch', () => {
  test('resolves immediately when fn succeeds on first call', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await retryFetch(fn, { sleep: noSleep });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('retries on retryable error and eventually succeeds', async () => {
    const err = Object.assign(new Error('reset'), { code: 'ECONNRESET' });
    const fn = jest.fn()
      .mockRejectedValueOnce(err)
      .mockRejectedValueOnce(err)
      .mockResolvedValue('recovered');

    const result = await retryFetch(fn, { maxRetries: 3, baseDelayMs: 10, sleep: noSleep });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('throws after exhausting all retries', async () => {
    const err = Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' });
    const fn = jest.fn().mockRejectedValue(err);

    await expect(
      retryFetch(fn, { maxRetries: 2, baseDelayMs: 10, sleep: noSleep })
    ).rejects.toThrow('timeout');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  test('does not retry on non-retryable error', async () => {
    const err = Object.assign(new Error('not found'), { statusCode: 404 });
    const fn = jest.fn().mockRejectedValue(err);

    await expect(
      retryFetch(fn, { maxRetries: 3, baseDelayMs: 10, sleep: noSleep })
    ).rejects.toThrow('not found');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
