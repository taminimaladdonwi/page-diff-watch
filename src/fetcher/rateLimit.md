# rateLimit

Controls how frequently a URL may be fetched, preventing accidental DoS of monitored sites.

## API

### `canFetch(url, minDelayMs?)`
Returns `true` if the URL has not been fetched recently (or ever).  
Default minimum delay: **2000 ms**.

### `recordFetch(url)`
Marks the current timestamp as the last fetch time for `url`.  
Call this immediately after a successful (or attempted) HTTP request.

### `msUntilNextFetch(url, minDelayMs?)`
Returns the number of milliseconds the caller should wait before fetching `url` again.  
Returns `0` if a fetch is already permitted.

### `resetUrl(url)`
Removes rate-limit state for a single URL. Useful for manual overrides or tests.

### `resetAll()`
Clears all tracked state. Primarily used between test runs.

## Usage

```js
const { canFetch, recordFetch, msUntilNextFetch } = require('./rateLimit');

if (!canFetch(url)) {
  const wait = msUntilNextFetch(url);
  await new Promise(r => setTimeout(r, wait));
}

recordFetch(url);
const html = await fetch(url).then(r => r.text());
```

## Notes

- State is held in-process memory; it resets when the process restarts.
- Each watched URL is tracked independently.
- The minimum delay is configurable per call, but the global default is `2000 ms`.
