/**
 * Parses an interval string like "30", "5m", "1h" into seconds.
 * Defaults to 60 seconds if input is invalid.
 */
export function parseInterval(value, defaultSeconds = 60) {
  if (value === undefined || value === null) return defaultSeconds;

  const str = String(value).trim().toLowerCase();

  const hourMatch = str.match(/^(\d+)h$/);
  if (hourMatch) {
    const hours = parseInt(hourMatch[1], 10);
    return hours * 3600;
  }

  const minuteMatch = str.match(/^(\d+)m$/);
  if (minuteMatch) {
    const minutes = parseInt(minuteMatch[1], 10);
    return minutes * 60;
  }

  const secondMatch = str.match(/^(\d+)s?$/);
  if (secondMatch) {
    const seconds = parseInt(secondMatch[1], 10);
    return seconds > 0 ? seconds : defaultSeconds;
  }

  return defaultSeconds;
}

/**
 * Returns a human-readable string for a given number of seconds.
 */
export function formatInterval(seconds) {
  if (seconds >= 3600 && seconds % 3600 === 0) {
    const h = seconds / 3600;
    return `${h}h`;
  }
  if (seconds >= 60 && seconds % 60 === 0) {
    const m = seconds / 60;
    return `${m}m`;
  }
  return `${seconds}s`;
}
