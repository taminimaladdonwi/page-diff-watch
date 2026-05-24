import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock node-notifier before importing the module under test
vi.mock('node-notifier', () => ({
  default: {
    notify: vi.fn(),
  },
}));

import notifier from 'node-notifier';
import { notifyChange, notifyError } from './notify.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('notifyChange', () => {
  it('throws if url is missing', () => {
    expect(() => notifyChange({})).toThrow('notifyChange requires a url');
  });

  it('calls notifier.notify with correct title and url', () => {
    notifyChange({ url: 'https://example.com' });
    expect(notifier.notify).toHaveBeenCalledOnce();
    const call = notifier.notify.mock.calls[0][0];
    expect(call.title).toBe('Page Changed');
    expect(call.open).toBe('https://example.com');
  });

  it('uses label as subtitle when provided', () => {
    notifyChange({ url: 'https://example.com', label: 'My Site' });
    const call = notifier.notify.mock.calls[0][0];
    expect(call.subtitle).toBe('My Site');
  });

  it('falls back to url as subtitle when no label', () => {
    notifyChange({ url: 'https://example.com' });
    const call = notifier.notify.mock.calls[0][0];
    expect(call.subtitle).toBe('https://example.com');
  });

  it('includes truncated diff in message', () => {
    const longDiff = 'x'.repeat(200);
    notifyChange({ url: 'https://example.com', diff: longDiff });
    const call = notifier.notify.mock.calls[0][0];
    expect(call.message.length).toBeLessThanOrEqual(100);
    expect(call.message).toContain('…');
  });

  it('includes short diff in message without truncation', () => {
    const shortDiff = 'small change';
    notifyChange({ url: 'https://example.com', diff: shortDiff });
    const call = notifier.notify.mock.calls[0][0];
    expect(call.message).toContain('small change');
    expect(call.message).not.toContain('…');
  });
});

describe('notifyError', () => {
  it('throws if url is missing', () => {
    expect(() => notifyError({})).toThrow('notifyError requires a url');
  });

  it('calls notifier.notify with error info', () => {
    notifyError({ url: 'https://example.com', error: 'Network timeout' });
    expect(notifier.notify).toHaveBeenCalledOnce();
    const call = notifier.notify.mock.calls[0][0];
    expect(call.title).toBe('Page Watch Error');
    expect(call.message).toContain('https://example.com');
    expect(call.message).toContain('Network timeout');
  });

  it('calls notifier.notify with only url when no error message provided', () => {
    notifyError({ url: 'https://example.com' });
    expect(notifier.notify).toHaveBeenCalledOnce();
    const call = notifier.notify.mock.calls[0][0];
    expect(call.message).toContain('https://example.com');
  });
});
