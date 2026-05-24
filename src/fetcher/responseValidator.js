/**
 * responseValidator.js
 * Validates HTTP responses before processing page content.
 * Checks status codes, content types, and response size limits.
 */

const MAX_CONTENT_LENGTH = 5 * 1024 * 1024; // 5MB

const ALLOWED_CONTENT_TYPES = [
  'text/html',
  'text/plain',
  'application/xhtml+xml',
  'application/xml',
  'text/xml',
];

/**
 * Returns true if the HTTP status code indicates success.
 * @param {number} statusCode
 * @returns {boolean}
 */
function isSuccessStatus(statusCode) {
  return statusCode >= 200 && statusCode < 300;
}

/**
 * Returns true if the content type is one we can process.
 * @param {string|undefined} contentType
 * @returns {boolean}
 */
function isSupportedContentType(contentType) {
  if (!contentType) return false;
  const normalized = contentType.toLowerCase().split(';')[0].trim();
  return ALLOWED_CONTENT_TYPES.some((allowed) => normalized === allowed);
}

/**
 * Returns true if content length is within acceptable limits.
 * @param {number|undefined} contentLength
 * @returns {boolean}
 */
function isWithinSizeLimit(contentLength) {
  if (contentLength === undefined || contentLength === null) return true;
  return contentLength <= MAX_CONTENT_LENGTH;
}

/**
 * Validates a response object and returns a result with ok flag and reason.
 * @param {{ statusCode: number, headers: Record<string, string> }} response
 * @returns {{ ok: boolean, reason: string|null }}
 */
function validateResponse(response) {
  if (!response || typeof response !== 'object') {
    return { ok: false, reason: 'Invalid response object' };
  }

  const { statusCode, headers = {} } = response;

  if (!isSuccessStatus(statusCode)) {
    return { ok: false, reason: `HTTP error: status ${statusCode}` };
  }

  const contentType = headers['content-type'] || headers['Content-Type'];
  if (!isSupportedContentType(contentType)) {
    return {
      ok: false,
      reason: `Unsupported content type: ${contentType || 'none'}`,
    };
  }

  const rawLength = headers['content-length'] || headers['Content-Length'];
  const contentLength = rawLength !== undefined ? parseInt(rawLength, 10) : undefined;
  if (!isWithinSizeLimit(contentLength)) {
    return {
      ok: false,
      reason: `Response too large: ${contentLength} bytes exceeds ${MAX_CONTENT_LENGTH} limit`,
    };
  }

  return { ok: true, reason: null };
}

module.exports = {
  validateResponse,
  isSuccessStatus,
  isSupportedContentType,
  isWithinSizeLimit,
  MAX_CONTENT_LENGTH,
  ALLOWED_CONTENT_TYPES,
};
