# parseSelector

Utility for validating and parsing CSS selectors used to target specific page content.

## Functions

### `validateSelector(selector)`

Checks whether a CSS selector string is syntactically valid.

**Returns:** `boolean`

### `parseSelector(input)`

Parses and normalizes a selector string.

**Returns:** `{ selector: string, label: string }` where `label` is a short human-readable description.

**Throws:** `Error` if the selector is empty or invalid.

### `formatSelector(parsed)`

Converts a parsed selector object back to a display string.

**Returns:** `string`

## Supported Selector Types

- Element selectors: `body`, `main`, `article`
- Class selectors: `.content`, `.article-body`
- ID selectors: `#main-content`
- Attribute selectors: `[data-content]`
- Combined: `div.content > p`

## Examples

```js
parseSelector('#main')        // { selector: '#main', label: 'id:main' }
parseSelector('.article')     // { selector: '.article', label: 'class:article' }
validateSelector('div > p')   // true
validateSelector('')          // false
```
