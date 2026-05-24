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

## Usage in Pipeline

```
fetchPage → extractContent → filterContent → normalizeContent → snapshotStore / diffEngine
```
