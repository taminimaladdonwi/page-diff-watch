import * as cheerio from 'cheerio';

/**
 * Extracts text content from an HTML string, optionally scoped to a CSS selector.
 *
 * @param {string} html - Raw HTML content.
 * @param {string|null} selector - Optional CSS selector to scope extraction.
 * @returns {{ text: string, found: boolean }}
 */
export function extractContent(html, selector = null) {
  const $ = cheerio.load(html);

  if (!selector) {
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    return { text, found: true };
  }

  const el = $(selector);
  if (el.length === 0) {
    return { text: '', found: false };
  }

  const text = el
    .map((_, node) => $(node).text())
    .get()
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { text, found: true };
}

/**
 * Extracts and joins inner HTML from matched elements.
 *
 * @param {string} html
 * @param {string|null} selector
 * @returns {string}
 */
export function extractHtml(html, selector = null) {
  const $ = cheerio.load(html);
  if (!selector) {
    return $('body').html()?.trim() ?? '';
  }
  const el = $(selector);
  if (el.length === 0) return '';
  return el
    .map((_, node) => $(node).html())
    .get()
    .join('\n')
    .trim();
}
