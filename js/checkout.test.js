// Mock browser globals before importing checkout.js
global.document = {
  addEventListener: () => {},
  getElementById: () => null,
  createElement: () => ({ classList: { add: () => {} } })
};
global.window = {
  location: { href: '' }
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

const { describe, test, expect } = require("bun:test");
const { escapeHTML } = require("./checkout.js");

describe("checkout.js - escapeHTML", () => {
  test("returns empty string for null or undefined", () => {
    expect(escapeHTML(null)).toBe("");
    expect(escapeHTML(undefined)).toBe("");
  });

  test("escapes HTML special characters", () => {
    expect(escapeHTML("&")).toBe("&amp;");
    expect(escapeHTML("<")).toBe("&lt;");
    expect(escapeHTML(">")).toBe("&gt;");
    expect(escapeHTML('"')).toBe("&quot;");
    expect(escapeHTML("'")).toBe("&#39;");
  });

  test("escapes a string with mixed HTML special characters", () => {
    expect(escapeHTML('<script>alert("XSS & DOM-based attacks\'")</script>'))
      .toBe("&lt;script&gt;alert(&quot;XSS &amp; DOM-based attacks&#39;&quot;)&lt;/script&gt;");
  });

  test("handles normal strings without special characters", () => {
    expect(escapeHTML("Hello World")).toBe("Hello World");
    expect(escapeHTML("12345")).toBe("12345");
  });

  test("handles non-string inputs by converting them to string", () => {
    expect(escapeHTML(123)).toBe("123");
    expect(escapeHTML(true)).toBe("true");
    expect(escapeHTML(false)).toBe("false");
    expect(escapeHTML({})).toBe("[object Object]");
  });
});
