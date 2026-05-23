#!/usr/bin/env node
import { program } from 'commander';
import { cmdAdd, cmdRemove, cmdList } from './commands.js';
import { startScheduler } from '../scheduler/scheduler.js';
import { load } from '../storage/watchlist.js';

program
  .name('page-diff-watch')
  .description('Monitor web pages for content changes and receive desktop notifications')
  .version('1.0.0');

program
  .command('add <url>')
  .description('Add a URL to the watch list')
  .option('-l, --label <label>', 'Human-readable label for the page')
  .option('-i, --interval <seconds>', 'Check interval in seconds', '60')
  .action((url, options) => cmdAdd(url, options));

program
  .command('remove <url>')
  .description('Remove a URL from the watch list')
  .action((url) => cmdRemove(url));

program
  .command('list')
  .description('List all watched pages')
  .action(() => cmdList());

program
  .command('start')
  .description('Start monitoring all watched pages')
  .action(async () => {
    const watchlist = await load();
    if (watchlist.length === 0) {
      console.log('No pages to watch. Use `add <url>` to get started.');
      process.exit(0);
    }
    console.log(`Starting scheduler for ${watchlist.length} page(s)...`);
    startScheduler(watchlist);
    console.log('Monitoring active. Press Ctrl+C to stop.');
  });

program.parse(process.argv);
