# parseSelector

Utility for parsing and validating CSS selectors used to scope page diff monitoring.

## Functions

### `validateSelector(selector)`

Returns `true` if the selector string is a valid CSS selector, `false` otherwise.

```js
validateSelector('div.content') // true
validateSelector('###bad')      // false
```

### `parseSelector(input)`

Parses a raw string input into a normalized selector object.

Returns `{ selector, label }` or throws if invalid.

```js
parseSelector('div.content')
// => { selector: 'div.content', label: 'div.content' }

parseSelector('main article:label=Article Body')
// => { selector: 'main article', label: 'Article Body' }
```

### `formatSelector(selectorObj)`

Formats a selector object back to a display string.

```js
formatSelector({ selector: 'div.content', label: 'Content' })
// => 'div.content (Content)'
```

## Notes

- Selector validation uses `document.querySelector` in a JSDOM context or a try/catch heuristic in Node.
- Labels are optional and default to the selector string itself.
