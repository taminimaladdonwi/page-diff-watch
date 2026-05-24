const { addEntry, removeEntry, load } = require('../storage/watchlist');
const { parseInterval } = require('./parseInterval');
const { parseSelector } = require('./parseSelector');
const { validateUrl, normalizeUrl } = require('../fetcher/urlValidator');
const { formatTable } = require('./formatTable');

function registerWatchCommands(program) {
  program
    .command('add <url>')
    .description('Add a URL to the watch list')
    .option('-i, --interval <interval>', 'Poll interval (e.g. 5m, 1h)', '5m')
    .option('-s, --selector <selector>', 'CSS selector to watch', null)
    .option('-l, --label <label>', 'Human-readable label for this entry')
    .action(async (url, opts) => {
      const validation = validateUrl(url);
      if (!validation.valid) {
        console.error(`Invalid URL: ${validation.reason}`);
        process.exit(1);
      }

      let intervalMs;
      try {
        intervalMs = parseInterval(opts.interval);
      } catch (e) {
        console.error(`Invalid interval: ${e.message}`);
        process.exit(1);
      }

      let selector = null;
      if (opts.selector) {
        try {
          selector = parseSelector(opts.selector);
        } catch (e) {
          console.error(`Invalid selector: ${e.message}`);
          process.exit(1);
        }
      }

      const normalized = normalizeUrl(url);
      const entry = await addEntry({
        url: normalized,
        intervalMs,
        selector,
        label: opts.label || normalized,
      });

      console.log(`Added: ${entry.label} (${entry.url}) — every ${opts.interval}`);
    });

  program
    .command('remove <url>')
    .description('Remove a URL from the watch list')
    .action(async (url) => {
      const normalized = normalizeUrl(url);
      const removed = await removeEntry(normalized);
      if (removed) {
        console.log(`Removed: ${normalized}`);
      } else {
        console.error(`Not found in watch list: ${normalized}`);
        process.exit(1);
      }
    });

  program
    .command('list')
    .description('List all watched URLs')
    .action(async () => {
      const entries = await load();
      if (!entries.length) {
        console.log('No URLs are being watched.');
        return;
      }
      const rows = entries.map((e) => ({
        Label: e.label,
        URL: e.url,
        Interval: `${e.intervalMs / 1000}s`,
        Selector: e.selector ? e.selector.value : '—',
      }));
      console.log(formatTable(rows));
    });
}

module.exports = { registerWatchCommands };
