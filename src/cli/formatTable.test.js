const { formatTable, pad, truncate } = require('./formatTable');

describe('pad', () => {
  it('pads a short string to the given length', () => {
    expect(pad('hi', 6)).toBe('hi    ');
  });

  it('returns the string unchanged when already at length', () => {
    expect(pad('hello', 5)).toBe('hello');
  });

  it('truncates strings longer than len', () => {
    expect(pad('toolong', 4)).toBe('tool');
  });

  it('handles null/undefined gracefully', () => {
    expect(pad(null, 4)).toBe('    ');
    expect(pad(undefined, 3)).toBe('   ');
  });
});

describe('truncate', () => {
  it('returns the string when within maxLen', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and appends ellipsis when too long', () => {
    const result = truncate('hello world', 8);
    expect(result).toHaveLength(8);
    expect(result.endsWith('\u2026')).toBe(true);
  });

  it('handles null/undefined gracefully', () => {
    expect(truncate(null, 5)).toBe('     ');
  });
});

describe('formatTable', () => {
  const entries = [
    { id: 'abc123', url: 'https://example.com', interval: 60, label: 'Example', selector: 'body' },
    { id: 'def456', url: 'https://news.ycombinator.com', interval: 300, label: undefined, selector: undefined },
  ];

  it('returns a no-entries message when array is empty', () => {
    expect(formatTable([])).toBe('No entries in watchlist.');
  });

  it('returns a no-entries message when called with null', () => {
    expect(formatTable(null)).toBe('No entries in watchlist.');
  });

  it('includes a header row', () => {
    const output = formatTable(entries);
    expect(output).toMatch(/ID/);
    expect(output).toMatch(/URL/);
    expect(output).toMatch(/Interval/);
    expect(output).toMatch(/Selector/);
  });

  it('includes entry data in the output', () => {
    const output = formatTable(entries);
    expect(output).toMatch(/abc123/);
    expect(output).toMatch(/Example/);
    expect(output).toMatch(/60s/);
  });

  it('shows em-dash for missing label and selector', () => {
    const output = formatTable(entries);
    const lines = output.split('\n');
    const secondEntry = lines.find((l) => l.includes('def456'));
    expect(secondEntry).toBeDefined();
    expect(secondEntry).toMatch(/—/);
  });

  it('produces the same number of lines as entries + 2 (header + divider)', () => {
    const output = formatTable(entries);
    const lines = output.split('\n');
    expect(lines).toHaveLength(entries.length + 2);
  });
});
