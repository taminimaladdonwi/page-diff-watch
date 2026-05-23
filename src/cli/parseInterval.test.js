const { parseInterval, formatInterval } = require('./parseInterval');

describe('parseInterval', () => {
  test('parses seconds', () => {
    expect(parseInterval('30s')).toBe(30000);
  });

  test('parses minutes', () => {
    expect(parseInterval('5m')).toBe(300000);
  });

  test('parses hours', () => {
    expect(parseInterval('2h')).toBe(7200000);
  });

  test('parses days', () => {
    expect(parseInterval('1d')).toBe(86400000);
  });

  test('parses decimal values', () => {
    expect(parseInterval('1.5h')).toBe(5400000);
  });

  test('throws on invalid format', () => {
    expect(() => parseInterval('5x')).toThrow('Invalid interval format');
    expect(() => parseInterval('abc')).toThrow('Invalid interval format');
    expect(() => parseInterval('m5')).toThrow('Invalid interval format');
  });

  test('throws on empty string', () => {
    expect(() => parseInterval('')).toThrow('non-empty string');
  });

  test('throws on non-string input', () => {
    expect(() => parseInterval(null)).toThrow('non-empty string');
    expect(() => parseInterval(60)).toThrow('non-empty string');
  });

  test('throws if interval is below minimum', () => {
    expect(() => parseInterval('5s')).toThrow('Interval too short');
    expect(() => parseInterval('9s')).toThrow('Interval too short');
  });

  test('accepts exactly the minimum interval', () => {
    expect(parseInterval('10s')).toBe(10000);
  });

  test('throws on zero value', () => {
    expect(() => parseInterval('0m')).toThrow('greater than zero');
  });
});

describe('formatInterval', () => {
  test('formats milliseconds to seconds', () => {
    expect(formatInterval(30000)).toBe('30s');
  });

  test('formats milliseconds to minutes', () => {
    expect(formatInterval(300000)).toBe('5m');
  });

  test('formats milliseconds to hours', () => {
    expect(formatInterval(7200000)).toBe('2h');
  });

  test('formats milliseconds to days', () => {
    expect(formatInterval(86400000)).toBe('1d');
  });

  test('falls back to seconds for non-round values', () => {
    expect(formatInterval(45000)).toBe('45s');
  });
});
