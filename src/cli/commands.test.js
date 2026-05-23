import { jest } from '@jest/globals';

const mockAddEntry = jest.fn();
const mockRemoveEntry = jest.fn();
const mockLoad = jest.fn();

jest.mock('../storage/watchlist.js', () => ({
  addEntry: mockAddEntry,
  removeEntry: mockRemoveEntry,
  load: mockLoad,
}));

const { cmdAdd, cmdRemove, cmdList } = await import('./commands.js');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  console.warn.mockRestore();
});

describe('cmdAdd', () => {
  test('adds a valid URL with defaults', async () => {
    mockAddEntry.mockResolvedValue({ url: 'https://example.com', label: 'https://example.com', interval: 60 });
    await cmdAdd('https://example.com');
    expect(mockAddEntry).toHaveBeenCalledWith({ url: 'https://example.com', label: 'https://example.com', interval: 60 });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Added watch entry'));
  });

  test('uses provided label and interval', async () => {
    mockAddEntry.mockResolvedValue({ url: 'https://example.com', label: 'My Site', interval: 30 });
    await cmdAdd('https://example.com', { label: 'My Site', interval: '30' });
    expect(mockAddEntry).toHaveBeenCalledWith({ url: 'https://example.com', label: 'My Site', interval: 30 });
  });
});

describe('cmdRemove', () => {
  test('removes an existing entry', async () => {
    mockRemoveEntry.mockResolvedValue(true);
    await cmdRemove('https://example.com');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Removed'));
  });

  test('warns when entry not found', async () => {
    mockRemoveEntry.mockResolvedValue(false);
    await cmdRemove('https://notfound.com');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('No entry found'));
  });
});

describe('cmdList', () => {
  test('displays message when watchlist is empty', async () => {
    mockLoad.mockResolvedValue([]);
    await cmdList();
    expect(console.log).toHaveBeenCalledWith('No pages are being watched.');
  });

  test('lists entries when watchlist has items', async () => {
    mockLoad.mockResolvedValue([{ url: 'https://example.com', label: 'Example', interval: 60, addedAt: Date.now() }]);
    await cmdList();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Watching 1 page(s)'));
  });
});
