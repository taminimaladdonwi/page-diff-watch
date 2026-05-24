const { addProxy, removeProxy, getNextProxy, listProxies, resetProxy } = require('../fetcher/proxyManager');

/**
 * Register proxy management CLI commands.
 * @param {import('commander').Command} program
 */
function registerProxyCommands(program) {
  const proxy = program
    .command('proxy')
    .description('Manage proxies used for fetching pages');

  proxy
    .command('add <url>')
    .description('Add a proxy (e.g. http://host:port)')
    .option('--weight <n>', 'Relative weight for selection', parseInt, 1)
    .action((url, opts) => {
      try {
        addProxy(url, { weight: opts.weight });
        console.log(`Proxy added: ${url} (weight: ${opts.weight})`);
      } catch (err) {
        console.error(`Error adding proxy: ${err.message}`);
        process.exitCode = 1;
      }
    });

  proxy
    .command('remove <url>')
    .description('Remove a proxy by URL')
    .action((url) => {
      try {
        removeProxy(url);
        console.log(`Proxy removed: ${url}`);
      } catch (err) {
        console.error(`Error removing proxy: ${err.message}`);
        process.exitCode = 1;
      }
    });

  proxy
    .command('reset <url>')
    .description('Reset failure count for a proxy')
    .action((url) => {
      try {
        resetProxy(url);
        console.log(`Proxy reset: ${url}`);
      } catch (err) {
        console.error(`Error resetting proxy: ${err.message}`);
        process.exitCode = 1;
      }
    });

  proxy
    .command('list')
    .description('List all configured proxies')
    .action(() => {
      const proxies = listProxies();
      if (!proxies.length) {
        console.log('No proxies configured.');
        return;
      }
      proxies.forEach((p) => {
        const status = p.disabled ? 'disabled' : 'active';
        console.log(`  ${p.url}  weight=${p.weight}  failures=${p.failures}  [${status}]`);
      });
    });

  proxy
    .command('next')
    .description('Show which proxy would be selected next')
    .action(() => {
      const p = getNextProxy();
      if (!p) {
        console.log('No available proxy.');
      } else {
        console.log(`Next proxy: ${p.url}`);
      }
    });
}

module.exports = { registerProxyCommands };
