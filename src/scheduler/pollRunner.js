import { checkForChanges } from '../fetcher/checkForChanges.js';
import { load } from '../storage/watchlist.js';
import { notifyChange, notifyError } from '../notifier/notify.js';

let isRunning = false;

/**
 * Runs a single poll cycle over all watched URLs.
 * Checks each entry for changes and fires notifications as needed.
 *
 * @returns {Promise<{ checked: number, changed: number, errors: number }>}
 */
export async function runPollCycle() {
  if (isRunning) {
    console.warn('[pollRunner] Previous poll cycle still running, skipping.');
    return { checked: 0, changed: 0, errors: 0 };
  }

  isRunning = true;
  const stats = { checked: 0, changed: 0, errors: 0 };

  try {
    const entries = await load();

    if (entries.length === 0) {
      console.log('[pollRunner] No watched URLs found.');
      return stats;
    }

    const results = await Promise.allSettled(
      entries.map((entry) => checkForChanges(entry))
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const entry = entries[i];
      stats.checked++;

      if (result.status === 'rejected') {
        stats.errors++;
        console.error(`[pollRunner] Error checking ${entry.url}:`, result.reason);
        await notifyError(entry.url, result.reason).catch(() => {});
        continue;
      }

      const { changed, diff } = result.value;
      if (changed) {
        stats.changed++;
        await notifyChange(entry.url, diff).catch((err) => {
          console.error(`[pollRunner] Failed to notify for ${entry.url}:`, err);
        });
      }
    }
  } finally {
    isRunning = false;
  }

  console.log(
    `[pollRunner] Cycle complete — checked: ${stats.checked}, changed: ${stats.changed}, errors: ${stats.errors}`
  );
  return stats;
}

export function isPollRunning() {
  return isRunning;
}
