import { describe, it, expect } from 'vitest';
import { extractContent, extractHtml } from './extractContent.js';

const sampleHtml = `
<html>
  <body>
    <header>Site Header</header>
    <main>
      <article class="post">
        <h1>Hello World</h1>
        <p>This is the body text.</p>
      </article>
    </main>
    <footer>Footer</footer>
  </body>
</html>
`;

describe('extractContent', () => {
  it('extracts full body text when no selector given', () => {
    const { text, found } = extractContent(sampleHtml);
    expect(found).toBe(true);
    expect(text).toContain('Hello World');
    expect(text).toContain('This is the body text.');
    expect(text).toContain('Footer');
  });

  it('extracts scoped text when selector matches', () => {
    const { text, found } = extractContent(sampleHtml, 'article.post');
    expect(found).toBe(true);
    expect(text).toContain('Hello World');
    expect(text).toContain('This is the body text.');
    expect(text).not.toContain('Footer');
  });

  it('returns found: false when selector does not match', () => {
    const { text, found } = extractContent(sampleHtml, '.nonexistent');
    expect(found).toBe(false);
    expect(text).toBe('');
  });

  it('normalizes whitespace', () => {
    const html = '<body><p>  lots   of   space  </p></body>';
    const { text } = extractContent(html);
    expect(text).toBe('lots of space');
  });
});

describe('extractHtml', () => {
  it('returns inner html of matched selector', () => {
    const result = extractHtml(sampleHtml, 'article.post');
    expect(result).toContain('<h1>Hello World</h1>');
    expect(result).toContain('<p>This is the body text.</p>');
  });

  it('returns empty string when selector does not match', () => {
    const result = extractHtml(sampleHtml, '.missing');
    expect(result).toBe('');
  });

  it('returns full body html when no selector given', () => {
    const result = extractHtml(sampleHtml);
    expect(result).toContain('article');
    expect(result).toContain('footer');
  });
});
