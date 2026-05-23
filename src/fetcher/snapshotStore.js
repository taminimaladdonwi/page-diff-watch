import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve('data');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'snapshots.json');

/**
 * Loads the snapshot map from disk.
 * @returns {Promise<Record<string, string>>} url -> hash
 */
export async function loadSnapshots() {
  try {
    const raw = await fs.readFile(SNAPSHOT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

/**
 * Saves the snapshot map to disk.
 * @param {Record<string, string>} snapshots
 */
export async function saveSnapshots(snapshots) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SNAPSHOT_FILE, JSON.stringify(snapshots, null, 2), 'utf8');
}

/**
 * Returns the stored hash for a URL, or null if not found.
 * @param {string} url
 * @returns {Promise<string|null>}
 */
export async function getSnapshot(url) {
  const snapshots = await loadSnapshots();
  return snapshots[url] ?? null;
}

/**
 * Stores (or updates) the hash for a URL.
 * @param {string} url
 * @param {string} hash
 */
export async function setSnapshot(url, hash) {
  const snapshots = await loadSnapshots();
  snapshots[url] = hash;
  await saveSnapshots(snapshots);
}

/**
 * Removes the snapshot for a URL.
 * @param {string} url
 */
export async function removeSnapshot(url) {
  const snapshots = await loadSnapshots();
  delete snapshots[url];
  await saveSnapshots(snapshots);
}
