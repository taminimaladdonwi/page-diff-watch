# retryFetch

Provides retry logic with exponential backoff for failed HTTP requests.

## Functions

### `isRetryable(error)`

Determines whether a given error or HTTP status code warrants a retry attempt.

**Parameters:**
- `error` — An `Error` object, optionally with a `statusCode` property.

**Returns:** `boolean` — `true` if the request should be retried.

**Retryable conditions:**
- Network errors (ECONNRESET, ETIMEDOUT, ENOTFOUND, ECONNREFUSED)
- HTTP 429 (Too Many Requests)
- HTTP 5xx (Server errors)

**Non-retryable conditions:**
- HTTP 4xx client errors (except 429)
- Parse errors
- Invalid URL errors

---

### `backoffDelay(attempt, baseMs?)`

Calculates the delay in milliseconds before the next retry using exponential backoff with jitter.

**Parameters:**
- `attempt` — Zero-based attempt index (0 = first retry).
- `baseMs` — Base delay in milliseconds (default: `500`).

**Returns:** `number` — Milliseconds to wait before retrying.

**Formula:**
```
delay = baseMs * 2^attempt + random jitter (0–200ms)
```

**Example:**
```js
backoffDelay(0); // ~500–700ms
backoffDelay(1); // ~1000–1200ms
backoffDelay(2); // ~2000–2200ms
```

---

## Usage

```js
import { isRetryable, backoffDelay } from './retryFetch.js';
import { httpGet } from './fetchPage.js';

async function fetchWithRetry(url, maxAttempts = 3) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await httpGet(url);
    } catch (err) {
      if (!isRetryable(err) || attempt === maxAttempts - 1) throw err;
      await new Promise(r => setTimeout(r, backoffDelay(attempt)));
    }
  }
}
```

## Notes

- Jitter helps prevent thundering herd when multiple watchers retry simultaneously.
- The caller is responsible for enforcing `maxAttempts`; these utilities are stateless.
- Pair with `rateLimit.js` to avoid hammering a server after transient failures.
