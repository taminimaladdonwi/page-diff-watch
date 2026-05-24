const { parseSelector, validateSelector, formatSelector } = require('./parseSelector');

describe('validateSelector', () => {
  test('returns null for a valid simple selector', () => {
    expect(validateSelector('#content')).toBeNull();
  });

  test('returns null for a compound selector', () => {
    expect(validateSelector('.article > p')).toBeNull();
  });

  test('returns error for empty string', () => {
    expect(validateSelector('')).toMatch(/empty/);
  });

  test('returns error for whitespace-only string', () => {
    expect(validateSelector('   ')).toMatch(/empty/);
  });

  test('returns error for non-string input', () => {
    expect(validateSelector(42)).toMatch(/string/);
  });

  test('returns error for selector exceeding 256 characters', () => {
    const long = '.item'.repeat(60);
    expect(validateSelector(long)).toMatch(/256/);
  });

  test('returns error for script selector', () => {
    expect(validateSelector('script')).toMatch(/not allowed/);
  });

  test('returns error for style selector', () => {
    expect(validateSelector('style')).toMatch(/not allowed/);
  });

  test('allows selectors that contain the word script in a class', () => {
    expect(validateSelector('.no-script')).toBeNull();
  });
});

describe('parseSelector', () => {
  test('returns null selector for undefined input', () => {
    expect(parseSelector(undefined)).toEqual({ selector: null, error: null });
  });

  test('returns null selector for empty string', () => {
    expect(parseSelector('')).toEqual({ selector: null, error: null });
  });

  test('returns trimmed selector for valid input', () => {
    expect(parseSelector('  #main  ')).toEqual({ selector: '#main', error: null });
  });

  test('returns error for invalid selector', () => {
    const result = parseSelector('script');
    expect(result.selector).toBeNull();
    expect(result.error).toBeTruthy();
  });
});

describe('formatSelector', () => {
  test('returns (whole page) for null', () => {
    expect(formatSelector(null)).toBe('(whole page)');
  });

  test('returns (whole page) for undefined', () => {
    expect(formatSelector(undefined)).toBe('(whole page)');
  });

  test('wraps selector in quotes', () => {
    expect(formatSelector('#content')).toBe('"#content"');
  });
});
