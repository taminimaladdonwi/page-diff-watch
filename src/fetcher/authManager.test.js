'use strict';

const {
  AUTH_TYPES,
  setCredentials,
  getCredentials,
  buildAuthHeader,
  removeCredentials,
  clearAll,
} = require('./authManager');

beforeEach(() => clearAll());

describe('setCredentials', () => {
  test('stores basic auth credentials', () => {
    setCredentials('example.com', { type: 'basic', username: 'user', password: 'pass' });
    expect(getCredentials('example.com')).toEqual({ type: 'basic', username: 'user', password: 'pass' });
  });

  test('stores bearer token credentials', () => {
    setCredentials('api.example.com', { type: 'bearer', token: 'abc123' });
    expect(getCredentials('api.example.com')).toEqual({ type: 'bearer', token: 'abc123' });
  });

  test('throws on invalid domain', () => {
    expect(() => setCredentials('', { type: 'bearer', token: 't' })).toThrow('Invalid domain');
  });

  test('throws on unsupported auth type', () => {
    expect(() => setCredentials('x.com', { type: 'digest' })).toThrow('Unsupported auth type');
  });

  test('throws when basic auth missing username', () => {
    expect(() => setCredentials('x.com', { type: 'basic', password: 'p' })).toThrow('username and password');
  });

  test('throws when bearer auth missing token', () => {
    expect(() => setCredentials('x.com', { type: 'bearer' })).toThrow('token');
  });
});

describe('getCredentials', () => {
  test('returns null for unknown domain', () => {
    expect(getCredentials('unknown.com')).toBeNull();
  });
});

describe('buildAuthHeader', () => {
  test('builds Basic auth header', () => {
    setCredentials('example.com', { type: 'basic', username: 'user', password: 'pass' });
    const header = buildAuthHeader('example.com');
    const expected = 'Basic ' + Buffer.from('user:pass').toString('base64');
    expect(header).toBe(expected);
  });

  test('builds Bearer auth header', () => {
    setCredentials('api.com', { type: 'bearer', token: 'mytoken' });
    expect(buildAuthHeader('api.com')).toBe('Bearer mytoken');
  });

  test('returns null for domain with no credentials', () => {
    expect(buildAuthHeader('none.com')).toBeNull();
  });
});

describe('removeCredentials', () => {
  test('removes stored credentials', () => {
    setCredentials('gone.com', { type: 'bearer', token: 't' });
    removeCredentials('gone.com');
    expect(getCredentials('gone.com')).toBeNull();
  });
});

describe('clearAll', () => {
  test('removes all credentials', () => {
    setCredentials('a.com', { type: 'bearer', token: 't1' });
    setCredentials('b.com', { type: 'bearer', token: 't2' });
    clearAll();
    expect(getCredentials('a.com')).toBeNull();
    expect(getCredentials('b.com')).toBeNull();
  });
});
