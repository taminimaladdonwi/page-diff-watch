# pollRunner

The `pollRunner` module is responsible for executing a single **poll cycle** across all currently watched URLs.

## Overview

It is invoked by the scheduler on each tick and performs the following steps:

1. Loads the current watchlist from disk via `storage/watchlist`.
2. Calls `checkForChanges` concurrently for every entry using `Promise.allSettled`.
3. For entries where a change is detected, fires a desktop notification via `notifyChange`.
4. For entries that threw an error, logs the failure and fires a `notifyError` notification.
5. Returns a stats object summarising the cycle.

## Concurrency Guard

A module-level `isRunning` flag prevents overlapping cycles. If the scheduler fires before the previous cycle finishes, the new invocation is skipped with a warning.

## API

```js
import { runPollCycle, isPollRunning } from './pollRunner.js';

// Execute one full poll pass
const { checked, changed, errors } = await runPollCycle();

// Check if a cycle is currently in progress
const busy = isPollRunning();
```

## Stats Object

| Field     | Type   | Description                              |
|-----------|--------|------------------------------------------|
| `checked` | number | Total entries processed this cycle       |
| `changed` | number | Entries where a content change was found |
| `errors`  | number | Entries that threw during the check      |
