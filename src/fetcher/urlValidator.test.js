"use strict";

const { validateUrl, normalizeUrl } = require("./urlValidator");

describe("validateUrl", () => {
  test("accepts a plain http URL", () => {
    const result = validateUrl("http://example.com/page");
    expect(result.valid).toBe(true);
    expect(result.url).toBeDefined();
  });

  test("accepts a plain https URL", () => {
    const result = validateUrl("https://example.com");
    expect(result.valid).toBe(true);
  });

  test("rejects an empty string", () => {
    const result = validateUrl("");
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/non-empty/i);
  });

  test("rejects a non-string value", () => {
    const result = validateUrl(42);
    expect(result.valid).toBe(false);
  });

  test("rejects a ftp URL", () => {
    const result = validateUrl("ftp://files.example.com/data");
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/not allowed/i);
  });

  test("rejects a malformed URL", () => {
    const result = validateUrl("not a url at all");
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/well-formed/i);
  });

  test("rejects a URL that is too long", () => {
    const long = "https://example.com/" + "a".repeat(2048);
    const result = validateUrl(long);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/maximum length/i);
  });

  test("trims surrounding whitespace before parsing", () => {
    const result = validateUrl("  https://example.com  ");
    expect(result.valid).toBe(true);
  });
});

describe("normalizeUrl", () => {
  test("lowercases scheme and host", () => {
    expect(normalizeUrl("HTTPS://Example.COM/path")).toBe("https://example.com/path");
  });

  test("strips default http port 80", () => {
    expect(normalizeUrl("http://example.com:80/page")).toBe("http://example.com/page");
  });

  test("strips default https port 443", () => {
    expect(normalizeUrl("https://example.com:443/")).toBe("https://example.com");
  });

  test("preserves non-default ports", () => {
    expect(normalizeUrl("http://example.com:8080/app")).toBe("http://example.com:8080/app");
  });

  test("removes trailing slash from root path", () => {
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com");
  });

  test("preserves query string and hash", () => {
    const url = "https://example.com/search?q=hello#results";
    expect(normalizeUrl(url)).toBe(url);
  });

  test("throws for an invalid URL", () => {
    expect(() => normalizeUrl("not-a-url")).toThrow();
  });
});
