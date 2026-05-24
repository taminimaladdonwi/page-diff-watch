const {
  validateResponse,
  isSuccessStatus,
  isSupportedContentType,
  isWithinSizeLimit,
  MAX_CONTENT_LENGTH,
} = require('./responseValidator');

describe('isSuccessStatus', () => {
  test('returns true for 200', () => expect(isSuccessStatus(200)).toBe(true));
  test('returns true for 201', () => expect(isSuccessStatus(201)).toBe(true));
  test('returns true for 299', () => expect(isSuccessStatus(299)).toBe(true));
  test('returns false for 301', () => expect(isSuccessStatus(301)).toBe(false));
  test('returns false for 404', () => expect(isSuccessStatus(404)).toBe(false));
  test('returns false for 500', () => expect(isSuccessStatus(500)).toBe(false));
});

describe('isSupportedContentType', () => {
  test('accepts text/html', () => expect(isSupportedContentType('text/html')).toBe(true));
  test('accepts text/html with charset', () =>
    expect(isSupportedContentType('text/html; charset=utf-8')).toBe(true));
  test('accepts text/plain', () => expect(isSupportedContentType('text/plain')).toBe(true));
  test('accepts application/xhtml+xml', () =>
    expect(isSupportedContentType('application/xhtml+xml')).toBe(true));
  test('rejects application/json', () =>
    expect(isSupportedContentType('application/json')).toBe(false));
  test('rejects image/png', () => expect(isSupportedContentType('image/png')).toBe(false));
  test('rejects undefined', () => expect(isSupportedContentType(undefined)).toBe(false));
  test('rejects empty string', () => expect(isSupportedContentType('')).toBe(false));
});

describe('isWithinSizeLimit', () => {
  test('returns true when undefined', () => expect(isWithinSizeLimit(undefined)).toBe(true));
  test('returns true when null', () => expect(isWithinSizeLimit(null)).toBe(true));
  test('returns true for small content', () => expect(isWithinSizeLimit(1024)).toBe(true));
  test('returns true at exact limit', () =>
    expect(isWithinSizeLimit(MAX_CONTENT_LENGTH)).toBe(true));
  test('returns false above limit', () =>
    expect(isWithinSizeLimit(MAX_CONTENT_LENGTH + 1)).toBe(false));
});

describe('validateResponse', () => {
  const validResponse = {
    statusCode: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  };

  test('returns ok for a valid response', () => {
    expect(validateResponse(validResponse)).toEqual({ ok: true, reason: null });
  });

  test('fails for non-object input', () => {
    const result = validateResponse(null);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/invalid/i);
  });

  test('fails for 404 status', () => {
    const result = validateResponse({ statusCode: 404, headers: {} });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/404/);
  });

  test('fails for unsupported content type', () => {
    const result = validateResponse({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/unsupported content type/i);
  });

  test('fails when content-length exceeds limit', () => {
    const result = validateResponse({
      statusCode: 200,
      headers: {
        'content-type': 'text/html',
        'content-length': String(MAX_CONTENT_LENGTH + 1),
      },
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/too large/i);
  });

  test('passes when content-length header is absent', () => {
    const result = validateResponse({
      statusCode: 200,
      headers: { 'content-type': 'text/plain' },
    });
    expect(result.ok).toBe(true);
  });
});
