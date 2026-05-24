import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS_DIR = path.resolve(__dirname, '../../data/snapshots');

export async function ensureSnapshotsDir() {
  await fs.mkdir(SNAPSHOTS_DIR, { recursive: true });
}

function snapshotPath(id) {
  const safeId = encodeURIComponent(id).replace(/%/g, '_');
  return path.join(SNAPSHOTS_DIR, `${safeId}.json`);
}

export async function loadSnapshot(id) {
  try {
    const raw = await fs.readFile(snapshotPath(id), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function saveSnapshot(id, data) {
  await ensureSnapshotsDir();
  const payload = {
    id,
    hash: data.hash,
    content: data.content,
    savedAt: new Date().toISOString(),
  };
  await fs.writeFile(snapshotPath(id), JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

export async function deleteSnapshot(id) {
  try {
    await fs.unlink(snapshotPath(id));
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

export async function listSnapshots() {
  await ensureSnapshotsDir();
  const files = await fs.readdir(SNAPSHOTS_DIR);
  return files
    .filter(f => f.endsWith('.json'))
    .map(f => decodeURIComponent(f.replace(/_/g, '%').replace(/\.json$/, '')));
}

/**
 * Returns the snapshot for the given id only if it exists and its hash
 * differs from the provided hash. Useful for skipping unchanged pages.
 *
 * @param {string} id - The snapshot identifier.
 * @param {string} hash - The current hash to compare against.
 * @returns {object|null} The stored snapshot if the hash changed, otherwise null.
 */
export async function loadSnapshotIfChanged(id, hash) {
  const snapshot = await loadSnapshot(id);
  if (!snapshot || snapshot.hash === hash) return null;
  return snapshot;
}
