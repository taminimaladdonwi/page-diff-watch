# redirectTracker

Tracks HTTP redirects for monitored URLs and detects when a page's final destination changes.

## Exports

### `resolveRedirects(url, maxRedirects?)`

Follows the redirect chain for the given URL and returns an object describing the outcome.

```js
const { resolveRedirects } = require('./redirectTracker');

const result = await resolveRedirects('https://example.com/old-path');
// {
//   finalUrl: 'https://example.com/new-path',
//   redirectChain: ['https://example.com/old-path'],
//   statusCode: 200
// }
```

**Parameters**
- `url` — The starting URL to resolve.
- `maxRedirects` — Maximum number of redirects to follow (default: `10`).

**Returns** `Promise<{ finalUrl, redirectChain, statusCode }>`

Throws if the redirect limit is exceeded or the URL is invalid.

---

### `checkRedirectChanged(originalUrl)`

Convenience wrapper that compares the resolved final URL against the original.

```js
const { checkRedirectChanged } = require('./redirectTracker');

const { changed, finalUrl } = await checkRedirectChanged('https://example.com/page');
if (changed) {
  console.log(`Page now redirects to ${finalUrl}`);
}
```

**Returns** `Promise<{ changed: boolean, finalUrl: string, redirectChain: string[] }>`

---

## Notes

- Supports both `http:` and `https:` protocols.
- Each request has an 8-second timeout to avoid hanging polls.
- Redirect chains are recorded in order, which can be useful for debugging CDN or SEO issues.
