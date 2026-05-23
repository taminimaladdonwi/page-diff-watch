# page-diff-watch

> Monitor web pages for content changes and receive instant desktop notifications.

## Installation

```bash
npm install -g page-diff-watch
```

## Usage

Start watching a page by providing a URL and a check interval:

```bash
page-diff-watch --url https://example.com --interval 60
```

You can also watch multiple pages using a config file:

```json
{
  "pages": [
    { "url": "https://example.com/releases", "interval": 300 },
    { "url": "https://news.ycombinator.com", "interval": 120 }
  ]
}
```

```bash
page-diff-watch --config ./watch.config.json
```

When a change is detected, a desktop notification will fire automatically with a summary of what changed.

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--url` | URL to monitor | — |
| `--interval` | Check interval in seconds | `60` |
| `--config` | Path to a config file | — |
| `--selector` | CSS selector to scope monitoring | `body` |

## Requirements

- Node.js >= 16
- A system that supports desktop notifications (Linux, macOS, Windows)

## License

MIT © page-diff-watch contributors