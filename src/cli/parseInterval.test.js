import { parseInterval, formatInterval } from './parseInterval.js';

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

  test('parses plain number as milliseconds', () => {
    expect(parseInterval('5000')).toBe(5000);
  });

  test('throws on invalid format', () => {
    expect(() => parseInterval('abc')).toThrow();
  });

  test('throws on zero value', () => {
    expect(() => parseInterval('0s')).toThrow();
  });

  test('throws on negative value', () => {
    expect(() => parseInterval('-5m')).toThrow();
  });

  test('throws on empty string', () => {
    expect(() => parseInterval('')).toThrow();
  });
});

describe('formatInterval', () => {
  test('formats milliseconds less than a minute as seconds', () => {
    expect(formatInterval(30000)).toBe('30s');
  });

  test('formats milliseconds as minutes', () => {
    expect(formatInterval(300000)).toBe('5m');
  });

  test('formats milliseconds as hours', () => {
    expect(formatInterval(7200000)).toBe('2h');
  });

  test('formats mixed hours and minutes', () => {
    expect(formatInterval(5400000)).toBe('1h 30m');
  });

  test('formats mixed minutes and seconds', () => {
    expect(formatInterval(90000)).toBe('1m 30s');
  });
});
