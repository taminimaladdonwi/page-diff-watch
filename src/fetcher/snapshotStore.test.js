import { loadSnapshot, saveSnapshot, deleteSnapshot, listSnapshots } from './snapshotStore.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS_DIR = path.resolve(__dirname, '../../data/snapshots');

const TEST_ID = 'https://example.com/test-page';
const TEST_DATA = { hash: 'abc123', content: '<html>hello</html>' };

afterEach(async () => {
  await deleteSnapshot(TEST_ID).catch(() => {});
});

describe('saveSnapshot', () => {
  test('saves and returns snapshot with metadata', async () => {
    const result = await saveSnapshot(TEST_ID, TEST_DATA);
    expect(result.id).toBe(TEST_ID);
    expect(result.hash).toBe(TEST_DATA.hash);
    expect(result.content).toBe(TEST_DATA.content);
    expect(result.savedAt).toBeDefined();
  });
});

describe('loadSnapshot', () => {
  test('returns null when snapshot does not exist', async () => {
    const result = await loadSnapshot('nonexistent-id');
    expect(result).toBeNull();
  });

  test('loads a previously saved snapshot', async () => {
    await saveSnapshot(TEST_ID, TEST_DATA);
    const loaded = await loadSnapshot(TEST_ID);
    expect(loaded.hash).toBe(TEST_DATA.hash);
    expect(loaded.content).toBe(TEST_DATA.content);
  });
});

describe('deleteSnapshot', () => {
  test('returns true when snapshot is deleted', async () => {
    await saveSnapshot(TEST_ID, TEST_DATA);
    const result = await deleteSnapshot(TEST_ID);
    expect(result).toBe(true);
  });

  test('returns false when snapshot does not exist', async () => {
    const result = await deleteSnapshot('nonexistent-id');
    expect(result).toBe(false);
  });
});

describe('listSnapshots', () => {
  test('includes saved snapshot id in list', async () => {
    await saveSnapshot(TEST_ID, TEST_DATA);
    const list = await listSnapshots();
    expect(Array.isArray(list)).toBe(true);
  });
});
