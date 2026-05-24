'use strict';

const {
  parseCookie,
  setCookies,
  getCookieHeader,
  clearDomain,
  clearAll,
  count,
} = require('./cookieJar');

beforeEach(() => clearAll());

describe('parseCookie', () => {
  test('parses a simple cookie header', () => {
    expect(parseCookie('session=abc123; Path=/')).toEqual({ name: 'session', value: 'abc123' });
  });

  test('parses a cookie without attributes', () => {
    expect(parseCookie('token=xyz')).toEqual({ name: 'token', value: 'xyz' });
  });

  test('returns null for empty string', () => {
    expect(parseCookie('')).toBeNull();
  });

  test('returns null for header without equals sign', () => {
    expect(parseCookie('badcookie')).toBeNull();
  });

  test('returns null for non-string input', () => {
    expect(parseCookie(null)).toBeNull();
    expect(parseCookie(42)).toBeNull();
  });
});

describe('setCookies and getCookieHeader', () => {
  test('stores and retrieves a single cookie', () => {
    setCookies('example.com', 'session=abc; Path=/');
    expect(getCookieHeader('example.com')).toBe('session=abc');
  });

  test('stores multiple cookies from array', () => {
    setCookies('example.com', ['a=1; Path=/', 'b=2; HttpOnly']);
    const header = getCookieHeader('example.com');
    expect(header).toContain('a=1');
    expect(header).toContain('b=2');
  });

  test('overwrites existing cookie with same name', () => {
    setCookies('example.com', 'session=old');
    setCookies('example.com', 'session=new');
    expect(getCookieHeader('example.com')).toBe('session=new');
  });

  test('returns empty string for unknown domain', () => {
    expect(getCookieHeader('unknown.com')).toBe('');
  });

  test('isolates cookies by domain', () => {
    setCookies('a.com', 'x=1');
    setCookies('b.com', 'y=2');
    expect(getCookieHeader('a.com')).toBe('x=1');
    expect(getCookieHeader('b.com')).toBe('y=2');
  });
});

describe('clearDomain', () => {
  test('removes cookies for a specific domain', () => {
    setCookies('example.com', 'session=abc');
    clearDomain('example.com');
    expect(getCookieHeader('example.com')).toBe('');
    expect(count('example.com')).toBe(0);
  });
});

describe('count', () => {
  test('returns correct cookie count', () => {
    setCookies('example.com', ['a=1', 'b=2', 'c=3']);
    expect(count('example.com')).toBe(3);
  });

  test('returns 0 for unknown domain', () => {
    expect(count('nope.com')).toBe(0);
  });
});
