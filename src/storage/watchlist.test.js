const fs = require('fs');
const path = require('path');
const os = require('os');

// Override data path before requiring the module
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'page-diff-watch-'));
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: (...args) => {
    if (args.includes('watchlist.json')) {
      return require('path').resolve(tmpDir, 'watchlist.json');
    }
    return jest.requireActual('path').join(...args);
  },
}));

const watchlist = require('./watchlist');

afterEach(() => {
  const file = path.resolve(tmpDir, 'watchlist.json');
  if (fs.existsSync(file)) fs.unlinkSync(file);
});

afterAll(() => {
  fs.rmdirSync(tmpDir, { recursive: true });
});

describe('watchlist storage', () => {
  test('load returns empty array when no file exists', () => {
    expect(watchlist.load()).toEqual([]);
  });

  test('addEntry creates and persists a new entry', () => {
    const entry = watchlist.addEntry('https://example.com', { label: 'Example', intervalMinutes: 10 });
    expect(entry).toMatchObject({ url: 'https://example.com', label: 'Example', intervalMinutes: 10 });
    expect(entry.id).toBeDefined();
    const loaded = watchlist.load();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].url).toBe('https://example.com');
  });

  test('addEntry throws on duplicate URL', () => {
    watchlist.addEntry('https://example.com');
    expect(() => watchlist.addEntry('https://example.com')).toThrow('already in watchlist');
  });

  test('removeEntry removes an existing entry', () => {
    const entry = watchlist.addEntry('https://example.com');
    const removed = watchlist.removeEntry(entry.id);
    expect(removed.id).toBe(entry.id);
    expect(watchlist.load()).toHaveLength(0);
  });

  test('removeEntry throws for unknown id', () => {
    expect(() => watchlist.removeEntry('nonexistent')).toThrow('Entry not found');
  });

  test('updateEntry persists changes', () => {
    const entry = watchlist.addEntry('https://example.com');
    const updated = watchlist.updateEntry(entry.id, { lastContentHash: 'abc123' });
    expect(updated.lastContentHash).toBe('abc123');
    expect(watchlist.load()[0].lastContentHash).toBe('abc123');
  });
});
