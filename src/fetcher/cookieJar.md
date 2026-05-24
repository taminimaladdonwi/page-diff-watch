# cookieJar

Per-domain cookie storage for authenticated page fetching.

## Purpose

Some watched pages require session cookies to serve content correctly.
`cookieJar` captures `Set-Cookie` response headers and replays them as
`Cookie` request headers on subsequent fetches to the same domain.

## API

### `parseCookie(header)`

Parses a single `Set-Cookie` header string into `{ name, value }`.
Only the first `name=value` pair is captured; attributes such as `Path`,
`HttpOnly`, and `Expires` are intentionally ignored.

Returns `null` if the header is invalid or empty.

### `setCookies(domain, headers)`

Stores cookies for a domain. `headers` may be a single string or an
array of strings (as returned by `http.IncomingMessage.headers['set-cookie']`).

Existing cookies with the same name are overwritten.

### `getCookieHeader(domain)`

Returns a `Cookie` header string (e.g. `session=abc; token=xyz`) ready to
be attached to an outgoing request for the given domain.

Returns an empty string if no cookies are stored for the domain.

### `clearDomain(domain)`

Removes all cookies stored for a specific domain.

### `clearAll()`

Removes all cookies across every domain. Used between test runs.

### `count(domain)`

Returns the number of cookies currently stored for a domain.

## Usage

```js
const cookieJar = require('./cookieJar');

// After receiving a response:
cookieJar.setCookies('example.com', response.headers['set-cookie']);

// Before sending the next request:
const cookieHeader = cookieJar.getCookieHeader('example.com');
// attach cookieHeader to request headers
```
