# extractContent

Utility module for extracting readable text or HTML from a fetched page, optionally scoped to a CSS selector.

## Functions

### `extractContent(html, selector?)`

Extracts normalized plain text from an HTML string.

- If `selector` is omitted, extracts the full `<body>` text.
- If `selector` is provided, extracts text only from matching elements.
- Returns `{ text: string, found: boolean }`.

```js
import { extractContent } from './extractContent.js';

const { text, found } = extractContent(html, 'article.post');
if (!found) console.warn('Selector matched nothing');
console.log(text);
```

### `extractHtml(html, selector?)`

Returns the inner HTML of matched elements as a single string.

Useful when you need to diff markup rather than plain text.

```js
import { extractHtml } from './extractContent.js';

const markup = extractHtml(html, 'main');
```

## Integration

This module is used by `checkForChanges.js` to scope content extraction before hashing and diffing:

```
fetchPage → extractContent → hashContent → computeDiff → notify
```

## Dependencies

- [`cheerio`](https://cheerio.js.org/) — server-side HTML parsing and querying.
