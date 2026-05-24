# authManager

Manages per-domain HTTP authentication credentials used when fetching watched pages.

## Supported Auth Types

| Type     | Required Fields            |
|----------|----------------------------|
| `basic`  | `username`, `password`     |
| `bearer` | `token`                    |

## API

### `setCredentials(domain, auth)`
Store authentication credentials for a domain.

```js
setCredentials('api.example.com', { type: 'bearer', token: 'my-secret-token' });
setCredentials('internal.example.com', { type: 'basic', username: 'admin', password: 's3cr3t' });
```

### `getCredentials(domain)`
Retrieve stored credentials for a domain. Returns `null` if none are set.

### `buildAuthHeader(domain)`
Builds the `Authorization` header string for a domain. Returns `null` if no credentials exist.

```js
const authHeader = buildAuthHeader('api.example.com');
// => 'Bearer my-secret-token'
```

### `removeCredentials(domain)`
Delete credentials for a specific domain.

### `clearAll()`
Remove all stored credentials (useful in tests or on logout).

## Integration

Use `buildAuthHeader` inside `fetchPage.js` or `fetchWithThrottle.js` to attach credentials to outgoing requests:

```js
const { buildAuthHeader } = require('./authManager');
const domain = new URL(url).hostname;
const authHeader = buildAuthHeader(domain);
if (authHeader) headers['Authorization'] = authHeader;
```
