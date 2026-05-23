import { load as loadWatchlist } from '../storage/watchlist.js';
import { checkForChanges } from '../fetcher/checkForChanges.js';
import { notifyChange, notifyError } from '../notifier/notify.js';

const DEFAULT_INTERVAL_MS = 60_000;

let timers = new Map();

export function startScheduler(intervalMs = DEFAULT_INTERVAL_MS) {
  console.log(`[scheduler] Starting with interval ${intervalMs}ms`);
  scheduleRound(intervalMs);
}

export function stopScheduler() {
  for (const [url, timer] of timers) {
    clearTimeout(timer);
    console.log(`[scheduler] Stopped watching: ${url}`);
  }
  timers.clear();
}

async function scheduleRound(intervalMs) {
  await runChecks();
  const timer = setTimeout(() => scheduleRound(intervalMs), intervalMs);
  timers.set('__global__', timer);
}

async function runChecks() {
  let entries;
  try {
    entries = await loadWatchlist();
  } catch (err) {
    console.error('[scheduler] Failed to load watchlist:', err.message);
    return;
  }

  if (entries.length === 0) {
    console.log('[scheduler] Watchlist is empty, nothing to check.');
    return;
  }

  console.log(`[scheduler] Checking ${entries.length} page(s)...`);

  await Promise.allSettled(
    entries.map(async (entry) => {
      try {
        const result = await checkForChanges(entry.url);
        if (result.changed) {
          notifyChange(entry.url, result.diff);
        }
      } catch (err) {
        notifyError(entry.url, err);
      }
    })
  );
}

export { runChecks };
