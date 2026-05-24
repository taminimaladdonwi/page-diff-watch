/**
 * requestThrottle.js
 * Manages concurrent request limits and per-domain throttling.
 */

const DEFAULT_MAX_CONCURRENT = 3;
const DEFAULT_DOMAIN_DELAY_MS = 1000;

const state = {
  maxConcurrent: DEFAULT_MAX_CONCURRENT,
  domainDelayMs: DEFAULT_DOMAIN_DELAY_MS,
  active: 0,
  queue: [],
  lastRequestTime: {},
};

function configure({ maxConcurrent, domainDelayMs } = {}) {
  if (maxConcurrent !== undefined) state.maxConcurrent = maxConcurrent;
  if (domainDelayMs !== undefined) state.domainDelayMs = domainDelayMs;
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function msUntilAvailable(url) {
  const domain = getDomain(url);
  const last = state.lastRequestTime[domain] || 0;
  const elapsed = Date.now() - last;
  return Math.max(0, state.domainDelayMs - elapsed);
}

function isConcurrencyAvailable() {
  return state.active < state.maxConcurrent;
}

async function acquire(url) {
  const wait = msUntilAvailable(url);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  if (!isConcurrencyAvailable()) {
    await new Promise((resolve) => state.queue.push(resolve));
  }
  state.active++;
  const domain = getDomain(url);
  state.lastRequestTime[domain] = Date.now();
}

function release() {
  state.active = Math.max(0, state.active - 1);
  if (state.queue.length > 0) {
    const next = state.queue.shift();
    next();
  }
}

function getStats() {
  return {
    active: state.active,
    queued: state.queue.length,
    maxConcurrent: state.maxConcurrent,
    domainDelayMs: state.domainDelayMs,
  };
}

function reset() {
  state.active = 0;
  state.queue = [];
  state.lastRequestTime = {};
  state.maxConcurrent = DEFAULT_MAX_CONCURRENT;
  state.domainDelayMs = DEFAULT_DOMAIN_DELAY_MS;
}

module.exports = { configure, acquire, release, msUntilAvailable, isConcurrencyAvailable, getStats, reset };
