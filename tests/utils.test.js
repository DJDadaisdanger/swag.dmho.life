import { expect, test, describe } from "bun:test";

const { escapeHTML } = require("../js/utils.js");

describe("escapeHTML Utilities", () => {
  test("escapeHTML should return empty string for null", () => {
    expect(escapeHTML(null)).toBe("");
  });

  test("escapeHTML should return empty string for undefined", () => {
    expect(escapeHTML(undefined)).toBe("");
  });

  test("escapeHTML should return empty string for empty string", () => {
    expect(escapeHTML("")).toBe("");
  });

  test("escapeHTML should escape &", () => {
    expect(escapeHTML("foo&bar")).toBe("foo&amp;bar");
  });

  test("escapeHTML should escape <", () => {
    expect(escapeHTML("foo<bar")).toBe("foo&lt;bar");
  });

  test("escapeHTML should escape >", () => {
    expect(escapeHTML("foo>bar")).toBe("foo&gt;bar");
  });

  test("escapeHTML should escape double quote", () => {
    expect(escapeHTML('foo"bar')).toBe("foo&quot;bar");
  });

  test("escapeHTML should escape single quote", () => {
    expect(escapeHTML("foo'bar")).toBe("foo&#39;bar");
  });

  test("escapeHTML should escape mixed special characters", () => {
    expect(escapeHTML("<div class='foo' id=\"bar\">&</div>")).toBe("&lt;div class=&#39;foo&#39; id=&quot;bar&quot;&gt;&amp;&lt;/div&gt;");
  });

  test("escapeHTML should convert numbers to string", () => {
    expect(escapeHTML(123)).toBe("123");
  });

  test("escapeHTML should not modify strings without special chars", () => {
    expect(escapeHTML("hello world")).toBe("hello world");
  });
});
