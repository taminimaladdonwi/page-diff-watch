import { fetchPage } from './fetchPage.js';
import { getSnapshot, saveSnapshot } from './snapshotStore.js';

/**
 * Checks whether the content of a watched page has changed since the last snapshot.
 *
 * @param {{ url: string, label: string }} entry - A watchlist entry.
 * @returns {Promise<{
 *   changed: boolean,
 *   isNew?: boolean,
 *   previous?: string,
 *   current?: string,
 *   url: string,
 *   label: string
 * }>}
 */
export async function checkForChanges(entry) {
  const { url, label } = entry;

  const { content, hash } = await fetchPage(url);
  const snapshot = await getSnapshot(url);

  if (!snapshot) {
    await saveSnapshot(url, { hash, content });
    return {
      changed: true,
      isNew: true,
      current: content,
      url,
      label,
    };
  }

  if (snapshot.hash === hash) {
    return {
      changed: false,
      url,
      label,
    };
  }

  await saveSnapshot(url, { hash, content });

  return {
    changed: true,
    isNew: false,
    previous: snapshot.content,
    current: content,
    url,
    label,
  };
}
