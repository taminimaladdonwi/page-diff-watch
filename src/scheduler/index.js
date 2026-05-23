/**
 * Scheduler entry point.
 * Reads WATCH_INTERVAL_MS from environment (default: 60000ms)
 * and starts the polling loop.
 */
import { startScheduler, stopScheduler } from './scheduler.js';

const intervalMs = parseInt(process.env.WATCH_INTERVAL_MS, 10) || 60_000;

startScheduler(intervalMs);

process.on('SIGINT', () => {
  console.log('\n[scheduler] Received SIGINT, shutting down...');
  stopScheduler();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[scheduler] Received SIGTERM, shutting down...');
  stopScheduler();
  process.exit(0);
});

export { startScheduler, stopScheduler };
