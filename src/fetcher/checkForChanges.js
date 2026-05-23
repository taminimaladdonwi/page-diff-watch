import { fetchAndHash } from './fetchPage.js';
import { getSnapshot, setSnapshot } from './snapshotStore.js';

/**
 * @typedef {Object} ChangeResult
 * @property {string} url
 * @property {boolean} changed
 * @property {string} newHash
 * @property {string|null} previousHash
 */

/**
 * Checks a single URL for content changes against its stored snapshot.
 * Updates the snapshot if a change is detected or if this is the first check.
 *
 * @param {string} url
 * @returns {Promise<ChangeResult>}
 */
export async function checkForChanges(url) {
  const [{ hash: newHash }, previousHash] = await Promise.all([
    fetchAndHash(url),
    getSnapshot(url),
  ]);

  const isFirstCheck = previousHash === null;
  const changed = !isFirstCheck && newHash !== previousHash;

  if (isFirstCheck || changed) {
    await setSnapshot(url, newHash);
  }

  return { url, changed, newHash, previousHash };
}

/**
 * Checks multiple URLs in parallel and returns all results.
 *
 * @param {string[]} urls
 * @returns {Promise<ChangeResult[]>}
 */
export async function checkAll(urls) {
  const results = await Promise.allSettled(urls.map((url) => checkForChanges(url)));

  return results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    console.error(`[checkAll] Failed to check ${urls[i]}:`, result.reason.message);
    return { url: urls[i], changed: false, newHash: null, previousHash: null, error: result.reason.message };
  });
}
