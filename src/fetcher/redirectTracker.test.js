const http = require('http');
const { resolveRedirects, checkRedirectChanged, MAX_REDIRECTS } = require('./redirectTracker');

describe('redirectTracker', () => {
  let server;
  let baseUrl;

  beforeAll((done) => {
    server = http.createServer((req, res) => {
      if (req.url === '/redirect') {
        res.writeHead(301, { Location: '/final' });
        res.end();
      } else if (req.url === '/chain') {
        res.writeHead(302, { Location: '/redirect' });
        res.end();
      } else if (req.url === '/final') {
        res.writeHead(200);
        res.end('ok');
      } else if (req.url === '/loop') {
        res.writeHead(301, { Location: '/loop' });
        res.end();
      } else {
        res.writeHead(200);
        res.end('ok');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => server.close(done));

  test('returns same URL when no redirect', async () => {
    const result = await resolveRedirects(`${baseUrl}/final`);
    expect(result.finalUrl).toBe(`${baseUrl}/final`);
    expect(result.redirectChain).toHaveLength(0);
    expect(result.statusCode).toBe(200);
  });

  test('follows a single redirect', async () => {
    const result = await resolveRedirects(`${baseUrl}/redirect`);
    expect(result.finalUrl).toBe(`${baseUrl}/final`);
    expect(result.redirectChain).toEqual([`${baseUrl}/redirect`]);
  });

  test('follows a redirect chain', async () => {
    const result = await resolveRedirects(`${baseUrl}/chain`);
    expect(result.finalUrl).toBe(`${baseUrl}/final`);
    expect(result.redirectChain).toHaveLength(2);
  });

  test('rejects on too many redirects', async () => {
    await expect(resolveRedirects(`${baseUrl}/loop`, 3)).rejects.toThrow('Too many redirects');
  });

  test('rejects on invalid URL', async () => {
    await expect(resolveRedirects('not-a-url')).rejects.toThrow('Invalid URL');
  });

  test('checkRedirectChanged detects changed URL', async () => {
    const result = await checkRedirectChanged(`${baseUrl}/redirect`);
    expect(result.changed).toBe(true);
    expect(result.finalUrl).toBe(`${baseUrl}/final`);
  });

  test('checkRedirectChanged reports no change for final URL', async () => {
    const result = await checkRedirectChanged(`${baseUrl}/final`);
    expect(result.changed).toBe(false);
  });

  test('MAX_REDIRECTS constant is 10', () => {
    expect(MAX_REDIRECTS).toBe(10);
  });
});
