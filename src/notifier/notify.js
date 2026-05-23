import notifier from 'node-notifier';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICON_PATH = path.resolve(__dirname, '../../assets/icon.png');

/**
 * Sends a desktop notification when a watched page has changed.
 * @param {object} options
 * @param {string} options.url - The URL that changed
 * @param {string} [options.label] - Optional human-readable label for the page
 * @param {string} [options.diff] - Optional short summary of what changed
 */
export function notifyChange({ url, label, diff } = {}) {
  if (!url) {
    throw new Error('notifyChange requires a url');
  }

  const title = 'Page Changed';
  const subtitle = label || url;
  const message = diff
    ? `Change detected: ${truncate(diff, 80)}`
    : 'Content has changed since last check.';

  notifier.notify({
    title,
    subtitle,
    message,
    icon: ICON_PATH,
    sound: false,
    wait: false,
    open: url,
  });
}

/**
 * Sends a desktop notification for an error that occurred while checking a page.
 * @param {object} options
 * @param {string} options.url
 * @param {string} options.error
 */
export function notifyError({ url, error } = {}) {
  if (!url) throw new Error('notifyError requires a url');

  notifier.notify({
    title: 'Page Watch Error',
    message: `Failed to check ${url}: ${truncate(String(error), 80)}`,
    icon: ICON_PATH,
    sound: false,
  });
}

function truncate(str, maxLen) {
  if (!str) return '';
  return str.length <= maxLen ? str : str.slice(0, maxLen - 1) + '…';
}
