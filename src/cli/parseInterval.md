# parseInterval

Utility for parsing and formatting interval strings used in the CLI.

## Functions

### `parseInterval(input)`

Parses a human-readable interval string into milliseconds.

**Supported formats:**
- `30s` → 30 seconds
- `5m` → 5 minutes
- `2h` → 2 hours
- `1d` → 1 day
- Plain numbers are treated as seconds

**Returns:** `number` (milliseconds)

**Throws:** `Error` if the format is invalid or value is out of range.

### `formatInterval(ms)`

Converts milliseconds back to a human-readable string.

**Returns:** `string` like `"5m"`, `"2h"`, `"1d"`

## Constraints

- Minimum interval: 10 seconds
- Maximum interval: 30 days

## Examples

```js
parseInterval('5m')   // 300000
parseInterval('1h')   // 3600000
formatInterval(3600000) // '1h'
formatInterval(300000)  // '5m'
```
