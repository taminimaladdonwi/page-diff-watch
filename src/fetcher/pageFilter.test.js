const { filterContent, matchesPattern, normalizeContent } = require('./pageFilter');

describe('matchesPattern', () => {
  test('matches substring case-insensitively', () => {
    expect(matchesPattern('Hello World', 'hello')).toBe(true);
    expect(matchesPattern('Hello World', 'xyz')).toBe(false);
  });

  test('matches RegExp patterns', () => {
    expect(matchesPattern('Price: $42.00', /\$\d+/)).toBe(true);
    expect(matchesPattern('No match here', /\$\d+/)).toBe(false);
  });
});

describe('filterContent', () => {
  const content = [
    'Stock: AAPL $150',
    'Stock: GOOG $2800',
    'Advertisement: Buy now!',
    'Stock: MSFT $300',
    'Footer text'
  ].join('\n');

  test('returns original content when no filters given', () => {
    expect(filterContent(content)).toBe(content);
  });

  test('include filter keeps only matching lines', () => {
    const result = filterContent(content, { include: ['Stock:'] });
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines.every(l => l.includes('Stock:'))).toBe(true);
  });

  test('exclude filter removes matching lines', () => {
    const result = filterContent(content, { exclude: ['Advertisement', 'Footer'] });
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines.some(l => l.includes('Advertisement'))).toBe(false);
  });

  test('include and exclude can be combined', () => {
    const result = filterContent(content, {
      include: ['Stock:'],
      exclude: ['GOOG']
    });
    const lines = result.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines.some(l => l.includes('GOOG'))).toBe(false);
  });

  test('handles empty content gracefully', () => {
    expect(filterContent('')).toBe('');
    expect(filterContent(null)).toBe('');
  });

  test('supports RegExp in include', () => {
    const result = filterContent(content, { include: [/\$\d+/] });
    expect(result.split('\n')).toHaveLength(3);
  });
});

describe('normalizeContent', () => {
  test('trims whitespace from each line', () => {
    const result = normalizeContent('  hello  \n  world  ');
    expect(result).toBe('hello\nworld');
  });

  test('collapses multiple blank lines into one', () => {
    const result = normalizeContent('a\n\n\nb');
    expect(result).toBe('a\n\nb');
  });

  test('handles empty and null input', () => {
    expect(normalizeContent('')).toBe('');
    expect(normalizeContent(null)).toBe('');
  });
});
