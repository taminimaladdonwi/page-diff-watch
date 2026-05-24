# contentCache

An in-memory LRU-style cache for recently fetched page content. It prevents redundant HTTP requests when multiple watchers target the same URL within a short polling window.

## API

### `configure(options)`
Adjust cache behaviour at runtime.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ttlMs` | number | `30000` | Time-to-live per entry in milliseconds |
| `maxSize` | number | `50` | Maximum number of URLs to cache |

### `get(url) → string | undefined`
Return cached content for `url`, or `undefined` if the entry is absent or expired. Accessing a valid entry refreshes its LRU position.

### `set(url, content)`
Store `content` for `url`. If the cache is at capacity the oldest entry is evicted first.

### `invalidate(url)`
Force-remove the cache entry for `url` (e.g. after a detected change).

### `clear()`
Remove all cached entries. Useful in tests or on scheduler restart.

### `size() → number`
Return the current number of cached entries.

## Usage example

```js
const cache = require('./contentCache');

cache.configure({ ttlMs: 60_000, maxSize: 100 });

let html = cache.get(url);
if (!html) {
  html = await httpGet(url);
  cache.set(url, html);
}
```

## Notes
- The cache is process-local and not persisted to disk.
- Call `invalidate(url)` after a change is detected so the next poll fetches fresh content.
