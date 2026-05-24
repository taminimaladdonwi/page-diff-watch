import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runChecks, stopScheduler } from './scheduler.js';

vi.mock('../storage/watchlist.js', () => ({
  load: vi.fn(),
}));

vi.mock('../fetcher/checkForChanges.js', () => ({
  checkForChanges: vi.fn(),
}));

vi.mock('../notifier/notify.js', () => ({
  notifyChange: vi.fn(),
  notifyError: vi.fn(),
}));

import { load as loadWatchlist } from '../storage/watchlist.js';
import { checkForChanges } from '../fetcher/checkForChanges.js';
import { notifyChange, notifyError } from '../notifier/notify.js';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  stopScheduler();
});

describe('runChecks', () => {
  it('does nothing when watchlist is empty', async () => {
    loadWatchlist.mockResolvedValue([]);
    await runChecks();
    expect(checkForChanges).not.toHaveBeenCalled();
  });

  it('calls checkForChanges for each entry', async () => {
    loadWatchlist.mockResolvedValue([
      { url: 'https://example.com' },
      { url: 'https://other.com' },
    ]);
    checkForChanges.mockResolvedValue({ changed: false });

    await runChecks();

    expect(checkForChanges).toHaveBeenCalledTimes(2);
    expect(checkForChanges).toHaveBeenCalledWith('https://example.com');
    expect(checkForChanges).toHaveBeenCalledWith('https://other.com');
  });

  it('calls notifyChange when a change is detected', async () => {
    loadWatchlist.mockResolvedValue([{ url: 'https://example.com' }]);
    checkForChanges.mockResolvedValue({ changed: true, diff: 'some diff' });

    await runChecks();

    expect(notifyChange).toHaveBeenCalledWith('https://example.com', 'some diff');
  });

  it('does not call notifyChange when no change is detected', async () => {
    loadWatchlist.mockResolvedValue([{ url: 'https://example.com' }]);
    checkForChanges.mockResolvedValue({ changed: false });

    await runChecks();

    expect(notifyChange).not.toHaveBeenCalled();
  });

  it('calls notifyError when checkForChanges throws', async () => {
    const error = new Error('network failure');
    loadWatchlist.mockResolvedValue([{ url: 'https://broken.com' }]);
    checkForChanges.mockRejectedValue(error);

    await runChecks();

    expect(notifyError).toHaveBeenCalledWith('https://broken.com', error);
  });

  it('handles watchlist load failure gracefully', async () => {
    loadWatchlist.mockRejectedValue(new Error('disk error'));
    await expect(runChecks()).resolves.toBeUndefined();
    expect(checkForChanges).not.toHaveBeenCalled();
  });
});
