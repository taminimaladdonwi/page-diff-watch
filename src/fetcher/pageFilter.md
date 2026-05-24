# pageFilter

Applies text-based include/exclude filters and whitespace normalization to extracted page content before diffing or storing snapshots.

## Functions

### `filterContent(content, options)`

Filters lines of a text string based on include/exclude patterns.

**Parameters:**
- `content` `{string}` — Raw text content (typically from `extractContent`)
- `options.include` `{Array<string|RegExp>}` — If provided, only lines matching at least one pattern are kept
- `options.exclude` `{Array<string|RegExp>}` — Lines matching any of these patterns are removed

**Returns:** `{string}` — Filtered multi-line string

**Throws:** `{TypeError}` — If `content` is not a string, or if `include`/`exclude` options are provided but are not arrays

**Example:**
```js
const { filterContent } = require('./pageFilter');

const filtered = filterContent(pageText, {
  include: ['price', 'stock'],
  exclude: ['advertisement']
});
```

### `matchesPattern(line, pattern)`

Checks whether a single line matches a given pattern.

- String patterns use case-insensitive substring matching.
- `RegExp` patterns are tested directly.

### `normalizeContent(content)`

Normalizes whitespace in content:
- Trims each line
- Collapses consecutive blank lines into a single blank line
- Trims leading/trailing whitespace from the result

Useful for reducing noise in diffs caused by formatting changes.

### `countFilteredLines(original, filtered)`

Returns a summary of how many lines were removed during filtering.

**Parameters:**
- `original` `{string}` — The content before filtering
- `filtered` `{string}` — The content after filtering

**Returns:** `{object}` — An object with `{ original, kept, removed }` line counts

**Example:**
```js
const { filterContent, countFilteredLines } = require('./pageFilter');

const filtered = filterContent(pageText, { exclude: ['advertisement'] });
const stats = countFilteredLines(pageText, filtered);
console.log(`Removed ${stats.removed} of ${stats.original} lines`);
```

## Usage in Pipeline

```
fetchPage → extractContent → filterContent → normalizeContent → snapshotStore / diffEngine
```
