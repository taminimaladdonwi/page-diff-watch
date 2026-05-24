const { fetchWithThrottle, fetchAll } = require('./fetchWithThrottle');
const throttle = require('./requestThrottle');
const fetchPage = require('./fetchPage');
const urlValidator = require('./urlValidator');

jest.mock('./fetchPage');
jest.mock('./requestThrottle');
jest.mock('./urlValidator');

beforeEach(() => {
  jest.clearAllMocks();
  urlValidator.validateUrl.mockReturnValue({ valid: true });
  urlValidator.normalizeUrl.mockImplementation((u) => u);
  throttle.acquire.mockResolvedValue(undefined);
  throttle.release.mockReturnValue(undefined);
});

describe('fetchWithThrottle', () => {
  it('acquires throttle, fetches, then releases', async () => {
    fetchPage.httpGet.mockResolvedValue({ status: 200, body: 'hello', headers: {} });
    const result = await fetchWithThrottle('http://example.com');
    expect(throttle.acquire).toHaveBeenCalledWith('http://example.com');
    expect(fetchPage.httpGet).toHaveBeenCalledWith('http://example.com', {});
    expect(throttle.release).toHaveBeenCalled();
    expect(result.status).toBe(200);
  });

  it('releases throttle even when fetch throws', async () => {
    fetchPage.httpGet.mockRejectedValue(new Error('network error'));
    await expect(fetchWithThrottle('http://example.com')).rejects.toThrow('network error');
    expect(throttle.release).toHaveBeenCalled();
  });

  it('throws on invalid URL without acquiring', async () => {
    urlValidator.validateUrl.mockReturnValue({ valid: false, reason: 'bad scheme' });
    await expect(fetchWithThrottle('ftp://bad')).rejects.toThrow('Invalid URL: bad scheme');
    expect(throttle.acquire).not.toHaveBeenCalled();
  });

  it('passes options to httpGet', async () => {
    fetchPage.httpGet.mockResolvedValue({ status: 200, body: '', headers: {} });
    await fetchWithThrottle('http://example.com', { headers: { 'X-Test': '1' } });
    expect(fetchPage.httpGet).toHaveBeenCalledWith('http://example.com', { headers: { 'X-Test': '1' } });
  });
});

describe('fetchAll', () => {
  it('returns results for all URLs', async () => {
    fetchPage.httpGet.mockResolvedValue({ status: 200, body: 'ok', headers: {} });
    const results = await fetchAll(['http://a.com', 'http://b.com']);
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ url: 'http://a.com', result: { status: 200 } });
    expect(results[1]).toMatchObject({ url: 'http://b.com', result: { status: 200 } });
  });

  it('records error for failed URLs without stopping', async () => {
    fetchPage.httpGet
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ status: 200, body: 'ok', headers: {} });
    const results = await fetchAll(['http://fail.com', 'http://ok.com']);
    expect(results[0]).toMatchObject({ url: 'http://fail.com', error: 'timeout' });
    expect(results[1]).toMatchObject({ url: 'http://ok.com', result: { status: 200 } });
  });

  it('returns empty array for empty input', async () => {
    const results = await fetchAll([]);
    expect(results).toEqual([]);
  });
});
