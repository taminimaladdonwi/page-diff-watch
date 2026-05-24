const cache = require('./contentCache');

beforeEach(() => {
  cache.clear();
  cache.configure({ ttlMs: 30_000, maxSize: 50 });
});

describe('contentCache', () => {
  test('returns undefined for unknown URL', () => {
    expect(cache.get('https://example.com')).toBeUndefined();
  });

  test('stores and retrieves content', () => {
    cache.set('https://example.com', '<html>hello</html>');
    expect(cache.get('https://example.com')).toBe('<html>hello</html>');
  });

  test('returns undefined for expired entry', () => {
    cache.configure({ ttlMs: 1 });
    cache.set('https://example.com', 'content');
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(cache.get('https://example.com')).toBeUndefined();
        resolve();
      }, 10);
    });
  });

  test('invalidate removes specific entry', () => {
    cache.set('https://a.com', 'aaa');
    cache.set('https://b.com', 'bbb');
    cache.invalidate('https://a.com');
    expect(cache.get('https://a.com')).toBeUndefined();
    expect(cache.get('https://b.com')).toBe('bbb');
  });

  test('clear removes all entries', () => {
    cache.set('https://a.com', 'aaa');
    cache.set('https://b.com', 'bbb');
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  test('evicts oldest entry when maxSize is reached', () => {
    cache.configure({ maxSize: 3 });
    cache.set('https://a.com', 'a');
    cache.set('https://b.com', 'b');
    cache.set('https://c.com', 'c');
    cache.set('https://d.com', 'd');
    expect(cache.size()).toBe(3);
    expect(cache.get('https://a.com')).toBeUndefined();
    expect(cache.get('https://d.com')).toBe('d');
  });

  test('overwriting a key does not grow cache size', () => {
    cache.set('https://a.com', 'v1');
    cache.set('https://a.com', 'v2');
    expect(cache.size()).toBe(1);
    expect(cache.get('https://a.com')).toBe('v2');
  });

  test('size reflects current number of entries', () => {
    expect(cache.size()).toBe(0);
    cache.set('https://x.com', 'x');
    expect(cache.size()).toBe(1);
  });
});
