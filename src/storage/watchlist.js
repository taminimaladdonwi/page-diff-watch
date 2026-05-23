const fs = require('fs');
const path = require('path');

const WATCHLIST_PATH = path.join(__dirname, '../../data/watchlist.json');

function ensureDataDir() {
  const dir = path.dirname(WATCHLIST_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function load() {
  ensureDataDir();
  if (!fs.existsSync(WATCHLIST_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(WATCHLIST_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function save(entries) {
  ensureDataDir();
  fs.writeFileSync(WATCHLIST_PATH, JSON.stringify(entries, null, 2), 'utf-8');
}

function addEntry(url, options = {}) {
  const entries = load();
  const existing = entries.find(e => e.url === url);
  if (existing) {
    throw new Error(`URL already in watchlist: ${url}`);
  }
  const entry = {
    id: Date.now().toString(),
    url,
    label: options.label || url,
    intervalMinutes: options.intervalMinutes || 15,
    selector: options.selector || null,
    createdAt: new Date().toISOString(),
    lastCheckedAt: null,
    lastContentHash: null,
  };
  entries.push(entry);
  save(entries);
  return entry;
}

function removeEntry(id) {
  const entries = load();
  const index = entries.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error(`Entry not found: ${id}`);
  }
  const [removed] = entries.splice(index, 1);
  save(entries);
  return removed;
}

function updateEntry(id, updates) {
  const entries = load();
  const entry = entries.find(e => e.id === id);
  if (!entry) {
    throw new Error(`Entry not found: ${id}`);
  }
  Object.assign(entry, updates);
  save(entries);
  return entry;
}

module.exports = { load, addEntry, removeEntry, updateEntry };
