# commands.proxy

CLI sub-commands for managing HTTP proxies used when fetching watched pages.

## Commands

### `proxy add <url> [--weight <n>]`
Register a new proxy URL. An optional `--weight` (default `1`) controls how
often this proxy is preferred during weighted round-robin selection.

```
page-diff-watch proxy add http://proxy.corp.example.com:8080 --weight 2
```

### `proxy remove <url>`
Unregister a proxy. Active polls will stop routing traffic through it on the
next request cycle.

```
page-diff-watch proxy remove http://proxy.corp.example.com:8080
```

### `proxy reset <url>`
Clear the failure counter for a proxy that was automatically disabled after
exceeding the `maxFailures` threshold.

```
page-diff-watch proxy reset http://proxy.corp.example.com:8080
```

### `proxy list`
Print all registered proxies with their weight, failure count, and status.

```
  http://proxy-a:3128  weight=2  failures=0  [active]
  http://proxy-b:3128  weight=1  failures=5  [disabled]
```

### `proxy next`
Show which proxy would be chosen for the next outgoing request without
actually making a request. Useful for debugging selection logic.

```
Next proxy: http://proxy-a:3128
```

## Notes
- Proxy state is managed in-memory by `proxyManager.js`.
- Disabled proxies are skipped automatically; use `proxy reset` to re-enable.
- If no proxies are configured, requests are made directly.
