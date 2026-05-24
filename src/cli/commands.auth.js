'use strict';

/**
 * commands.auth.js
 * CLI sub-commands for managing per-domain authentication credentials.
 */

const { setCredentials, removeCredentials, getCredentials, clearAll } = require('../fetcher/authManager');

/**
 * Register auth sub-commands on a commander program.
 * @param {import('commander').Command} program
 */
function registerAuthCommands(program) {
  const auth = program.command('auth').description('Manage authentication credentials for watched domains');

  auth
    .command('set-basic <domain> <username> <password>')
    .description('Set Basic Auth credentials for a domain')
    .action((domain, username, password) => {
      try {
        setCredentials(domain, { type: 'basic', username, password });
        console.log(`Basic auth set for ${domain}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exitCode = 1;
      }
    });

  auth
    .command('set-bearer <domain> <token>')
    .description('Set Bearer token credentials for a domain')
    .action((domain, token) => {
      try {
        setCredentials(domain, { type: 'bearer', token });
        console.log(`Bearer token set for ${domain}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exitCode = 1;
      }
    });

  auth
    .command('show <domain>')
    .description('Show stored auth type for a domain (credentials are not printed)')
    .action((domain) => {
      const creds = getCredentials(domain);
      if (!creds) {
        console.log(`No credentials stored for ${domain}`);
      } else {
        console.log(`${domain}: ${creds.type} auth configured`);
      }
    });

  auth
    .command('remove <domain>')
    .description('Remove credentials for a domain')
    .action((domain) => {
      removeCredentials(domain);
      console.log(`Credentials removed for ${domain}`);
    });

  auth
    .command('clear')
    .description('Remove all stored credentials')
    .action(() => {
      clearAll();
      console.log('All credentials cleared.');
    });
}

module.exports = { registerAuthCommands };
