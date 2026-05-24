# parseSelector

Utility module for parsing and validating CSS selectors supplied via the CLI when adding a watch entry.

## Purpose

When a user adds a URL to the watchlist they may optionally provide a CSS selector (`--selector`) to restrict change detection to a specific region of the page rather than the entire document body.

This module ensures the selector is safe and well-formed before it is persisted to the watchlist.

## API

### `parseSelector(raw: string | undefined) → { selector, error }`

Parses a raw string from the CLI.

- If `raw` is `undefined`, `null`, or `''`, returns `{ selector: null, error: null }` — meaning "watch the whole page".
- If the selector is valid, returns `{ selector: trimmedString, error: null }`.
- If the selector is invalid, returns `{ selector: null, error: 'reason...' }`.

### `validateSelector(selector: string) → string | null`

Returns `null` when the selector is acceptable, or a human-readable error message when it is not.

Rules enforced:
- Must be a non-empty string.
- Must not exceed 256 characters.
- Must not target `script` or `style` elements directly (security / noise prevention).

### `formatSelector(selector: string | null) → string`

Formats a selector for display in CLI output.

| Input | Output |
|-------|--------|
| `null` / `undefined` | `(whole page)` |
| `"#content"` | `"#content"` |

## Usage

```js
const { parseSelector, formatSelector } = require('./parseSelector');

const { selector, error } = parseSelector(argv.selector);
if (error) {
  console.error(`Invalid selector: ${error}`);
  process.exit(1);
}
console.log(`Watching: ${formatSelector(selector)}`);
```
