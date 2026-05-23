import { jest } from '@jest/globals';
import { checkForChanges } from './checkForChanges.js';

const mockFetchPage = jest.fn();
const mockGetSnapshot = jest.fn();
const mockSaveSnapshot = jest.fn();

jest.mock('./fetchPage.js', () => ({
  fetchPage: (...args) => mockFetchPage(...args),
  hashContent: (content) => require('crypto').createHash('sha256').update(content).digest('hex'),
}));

jest.mock('./snapshotStore.js', () => ({
  getSnapshot: (...args) => mockGetSnapshot(...args),
  saveSnapshot: (...args) => mockSaveSnapshot(...args),
}));

describe('checkForChanges', () => {
  const entry = { url: 'https://example.com', label: 'Example' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns { changed: false } when content is identical to snapshot', async () => {
    mockFetchPage.mockResolvedValue({ content: 'hello world', hash: 'abc123' });
    mockGetSnapshot.mockResolvedValue({ hash: 'abc123', content: 'hello world' });

    const result = await checkForChanges(entry);

    expect(result.changed).toBe(false);
    expect(mockSaveSnapshot).not.toHaveBeenCalled();
  });

  it('returns { changed: true, diff } when content has changed', async () => {
    mockFetchPage.mockResolvedValue({ content: 'new content', hash: 'def456' });
    mockGetSnapshot.mockResolvedValue({ hash: 'abc123', content: 'old content' });

    const result = await checkForChanges(entry);

    expect(result.changed).toBe(true);
    expect(result.previous).toBe('old content');
    expect(result.current).toBe('new content');
    expect(mockSaveSnapshot).toHaveBeenCalledWith(entry.url, {
      hash: 'def456',
      content: 'new content',
    });
  });

  it('returns { changed: true, isNew: true } when no previous snapshot exists', async () => {
    mockFetchPage.mockResolvedValue({ content: 'first content', hash: 'aaa111' });
    mockGetSnapshot.mockResolvedValue(null);

    const result = await checkForChanges(entry);

    expect(result.changed).toBe(true);
    expect(result.isNew).toBe(true);
    expect(mockSaveSnapshot).toHaveBeenCalled();
  });

  it('throws and propagates errors from fetchPage', async () => {
    mockFetchPage.mockRejectedValue(new Error('Network error'));
    mockGetSnapshot.mockResolvedValue(null);

    await expect(checkForChanges(entry)).rejects.toThrow('Network error');
  });
});
