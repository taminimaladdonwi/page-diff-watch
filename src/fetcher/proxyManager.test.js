const {
  addProxy,
  removeProxy,
  getNextProxy,
  recordFailure,
  resetProxy,
  clearAll,
  listProxies,
} = require('./proxyManager');

beforeEach(() => {
  clearAll();
});

describe('addProxy', () => {
  it('adds a proxy to the pool', () => {
    addProxy('http://proxy1:8080');
    expect(listProxies()).toHaveLength(1);
    expect(listProxies()[0].url).toBe('http://proxy1:8080');
  });

  it('stores optional credentials', () => {
    addProxy('http://proxy2:8080', { username: 'user', password: 'pass' });
    const p = listProxies()[0];
    expect(p.username).toBe('user');
    expect(p.password).toBe('pass');
  });

  it('does not add duplicate proxies', () => {
    addProxy('http://proxy1:8080');
    addProxy('http://proxy1:8080');
    expect(listProxies()).toHaveLength(1);
  });

  it('throws on invalid URL', () => {
    expect(() => addProxy('')).toThrow();
    expect(() => addProxy(null)).toThrow();
  });
});

describe('removeProxy', () => {
  it('removes a proxy by URL', () => {
    addProxy('http://proxy1:8080');
    removeProxy('http://proxy1:8080');
    expect(listProxies()).toHaveLength(0);
  });

  it('does nothing if proxy not found', () => {
    addProxy('http://proxy1:8080');
    removeProxy('http://nonexistent:9999');
    expect(listProxies()).toHaveLength(1);
  });
});

describe('getNextProxy', () => {
  it('returns null when pool is empty', () => {
    expect(getNextProxy()).toBeNull();
  });

  it('returns a proxy from the pool', () => {
    addProxy('http://proxy1:8080');
    const p = getNextProxy();
    expect(p).not.toBeNull();
    expect(p.url).toBe('http://proxy1:8080');
  });

  it('rotates through available proxies', () => {
    addProxy('http://proxy1:8080');
    addProxy('http://proxy2:8080');
    const first = getNextProxy();
    const second = getNextProxy();
    expect(first.url).not.toBe(second.url);
  });

  it('skips disabled proxies', () => {
    addProxy('http://proxy1:8080');
    addProxy('http://proxy2:8080');
    recordFailure('http://proxy1:8080');
    recordFailure('http://proxy1:8080');
    recordFailure('http://proxy1:8080');
    const p = getNextProxy();
    expect(p.url).toBe('http://proxy2:8080');
  });
});

describe('recordFailure', () => {
  it('disables proxy after 3 failures', () => {
    addProxy('http://proxy1:8080');
    recordFailure('http://proxy1:8080');
    recordFailure('http://proxy1:8080');
    recordFailure('http://proxy1:8080');
    expect(listProxies()[0].disabled).toBe(true);
  });

  it('does not disable before 3 failures', () => {
    addProxy('http://proxy1:8080');
    recordFailure('http://proxy1:8080');
    recordFailure('http://proxy1:8080');
    expect(listProxies()[0].disabled).toBe(false);
  });
});

describe('resetProxy', () => {
  it('re-enables a disabled proxy', () => {
    addProxy('http://proxy1:8080');
    recordFailure('http://proxy1:8080');
    recordFailure('http://proxy1:8080');
    recordFailure('http://proxy1:8080');
    resetProxy('http://proxy1:8080');
    expect(listProxies()[0].disabled).toBe(false);
    expect(listProxies()[0].failures).toBe(0);
  });
});
