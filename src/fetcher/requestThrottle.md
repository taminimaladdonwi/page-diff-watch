# requestThrottle

Manages concurrent HTTP request limits and per-domain throttling to avoid overloading servers or triggering rate limiting.

## API

### `configure({ maxConcurrent, domainDelayMs })`
Sets the maximum number of concurrent in-flight requests and the minimum delay between requests to the same domain.

- `maxConcurrent` (default: `3`) — max simultaneous requests across all domains.
- `domainDelayMs` (default: `1000`) — minimum milliseconds between requests to the same hostname.

### `acquire(url): Promise<void>`
Call before making a request. Waits if the domain delay has not elapsed or if concurrency is at the limit. Records the request time for the domain.

### `release()`
Call after a request completes (success or failure). Decrements the active counter and unblocks the next queued acquire if any.

### `msUntilAvailable(url): number`
Returns how many milliseconds remain before a request to the given URL's domain is allowed. Returns `0` if the domain is ready.

### `isConcurrencyAvailable(): boolean`
Returns `true` if a new request can start without exceeding `maxConcurrent`.

### `getStats(): object`
Returns `{ active, queued, maxConcurrent, domainDelayMs }`.

### `reset()`
Restores all state to defaults. Intended for testing.

## Usage

```js
const throttle = require('./requestThrottle');

throttle.configure({ maxConcurrent: 2, domainDelayMs: 500 });

await throttle.acquire(url);
try {
  const result = await httpGet(url);
} finally {
  throttle.release();
}
```
