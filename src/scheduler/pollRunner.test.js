import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runPollCycle, isPollRunning } from './pollRunner.js';

vi.mock('../storage/watchlist.js');
vi.mock('../fetcher/checkForChanges.js');
vi.mock('../notifier/notify.js');

import { load } from '../storage/watchlist.js';
import { checkForChanges } from '../fetcher/checkForChanges.js';
import { notifyChange, notifyError } from '../notifier/notify.js';

describe('runPollCycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notifyChange.mockResolvedValue(undefined);
    notifyError.mockResolvedValue(undefined);
  });

  it('returns zero stats when watchlist is empty', async () => {
    load.mockResolvedValue([]);
    const stats = await runPollCycle();
    expect(stats).toEqual({ checked: 0, changed: 0, errors: 0 });
    expect(checkForChanges).not.toHaveBeenCalled();
  });

  it('checks each entry and returns correct stats when nothing changed', async () => {
    load.mockResolvedValue([
      { url: 'https://example.com', interval: 60 },
      { url: 'https://other.com', interval: 120 },
    ]);
    checkForChanges.mockResolvedValue({ changed: false, diff: null });

    const stats = await runPollCycle();
    expect(stats.checked).toBe(2);
    expect(stats.changed).toBe(0);
    expect(stats.errors).toBe(0);
    expect(notifyChange).not.toHaveBeenCalled();
  });

  it('calls notifyChange when a page has changed', async () => {
    load.mockResolvedValue([{ url: 'https://example.com', interval: 60 }]);
    const diff = { added: ['new line'], removed: [] };
    checkForChanges.mockResolvedValue({ changed: true, diff });

    const stats = await runPollCycle();
    expect(stats.changed).toBe(1);
    expect(notifyChange).toHaveBeenCalledWith('https://example.com', diff);
  });

  it('records errors and calls notifyError when checkForChanges rejects', async () => {
    load.mockResolvedValue([{ url: 'https://broken.com', interval: 60 }]);
    checkForChanges.mockRejectedValue(new Error('Network failure'));

    const stats = await runPollCycle();
    expect(stats.errors).toBe(1);
    expect(stats.changed).toBe(0);
    expect(notifyError).toHaveBeenCalledWith(
      'https://broken.com',
      expect.any(Error)
    );
  });

  it('isPollRunning returns false when no cycle is active', () => {
    expect(isPollRunning()).toBe(false);
  });
});
