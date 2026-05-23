import { addEntry, removeEntry, load } from '../storage/watchlist.js';

export async function cmdAdd(url, options = {}) {
  if (!url || !url.startsWith('http')) {
    console.error('Error: A valid URL starting with http(s) is required.');
    process.exit(1);
  }

  const interval = parseInt(options.interval, 10) || 60;
  const label = options.label || url;

  try {
    const entry = await addEntry({ url, label, interval });
    console.log(`✓ Added watch entry: "${entry.label}" (every ${entry.interval}s)`);
  } catch (err) {
    console.error(`Error adding entry: ${err.message}`);
    process.exit(1);
  }
}

export async function cmdRemove(url) {
  if (!url) {
    console.error('Error: URL is required.');
    process.exit(1);
  }

  try {
    const removed = await removeEntry(url);
    if (removed) {
      console.log(`✓ Removed watch entry for: ${url}`);
    } else {
      console.warn(`No entry found for: ${url}`);
    }
  } catch (err) {
    console.error(`Error removing entry: ${err.message}`);
    process.exit(1);
  }
}

export async function cmdList() {
  try {
    const watchlist = await load();
    if (watchlist.length === 0) {
      console.log('No pages are being watched.');
      return;
    }
    console.log(`Watching ${watchlist.length} page(s):\n`);
    watchlist.forEach((entry, i) => {
      console.log(`  ${i + 1}. ${entry.label}`);
      console.log(`     URL:      ${entry.url}`);
      console.log(`     Interval: ${entry.interval}s`);
      console.log(`     Added:    ${new Date(entry.addedAt).toLocaleString()}\n`);
    });
  } catch (err) {
    console.error(`Error loading watchlist: ${err.message}`);
    process.exit(1);
  }
}
