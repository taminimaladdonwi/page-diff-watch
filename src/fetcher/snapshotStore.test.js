import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSnapshots, saveSnapshots, getSnapshot, setSnapshot, removeSnapshot } from './snapshotStore.js';

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
}));

import fs from 'fs/promises';

const MOCK_SNAPSHOTS = { 'https://example.com': 'abc123' };

beforeEach(() => {
  vi.clearAllMocks();
  fs.readFile.mockResolvedValue(JSON.stringify(MOCK_SNAPSHOTS));
  fs.writeFile.mockResolvedValue(undefined);
  fs.mkdir.mockResolvedValue(undefined);
});

describe('loadSnapshots', () => {
  it('returns parsed JSON from file', async () => {
    const result = await loadSnapshots();
    expect(result).toEqual(MOCK_SNAPSHOTS);
  });

  it('returns empty object when file not found', async () => {
    fs.readFile.mockRejectedValue(Object.assign(new Error(), { code: 'ENOENT' }));
    const result = await loadSnapshots();
    expect(result).toEqual({});
  });
});

describe('getSnapshot', () => {
  it('returns hash for known url', async () => {
    expect(await getSnapshot('https://example.com')).toBe('abc123');
  });

  it('returns null for unknown url', async () => {
    expect(await getSnapshot('https://unknown.com')).toBeNull();
  });
});

describe('setSnapshot', () => {
  it('writes updated snapshots', async () => {
    await setSnapshot('https://new.com', 'def456');
    const written = JSON.parse(fs.writeFile.mock.calls[0][1]);
    expect(written['https://new.com']).toBe('def456');
  });
});

describe('removeSnapshot', () => {
  it('removes the url from snapshots', async () => {
    await removeSnapshot('https://example.com');
    const written = JSON.parse(fs.writeFile.mock.calls[0][1]);
    expect(written['https://example.com']).toBeUndefined();
  });
});
