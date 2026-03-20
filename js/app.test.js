import { expect, test, describe } from "bun:test";

// Mocking browser globals at the very top before requiring app.js
global.document = {
  addEventListener: () => {},
  getElementById: () => ({
    addEventListener: () => {},
    innerHTML: "",
    style: {},
    querySelector: () => ({ addEventListener: () => {} }),
    querySelectorAll: () => []
  }),
  querySelectorAll: () => [],
  body: {
      insertAdjacentHTML: () => {}
  }
};
global.window = {
  location: { href: "" },
  pendingLoginActions: [],
  pendingLoginActionsLogin: []
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

const { escapeHTML } = require("./app.js");

describe("escapeHTML", () => {
  test("escapes basic HTML entities", () => {
    expect(escapeHTML("&")).toBe("&amp;");
    expect(escapeHTML("<")).toBe("&lt;");
    expect(escapeHTML(">")).toBe("&gt;");
    expect(escapeHTML('"')).toBe("&quot;");
    expect(escapeHTML("'")).toBe("&#39;");
  });

  test("escapes mixed special and normal characters", () => {
    expect(escapeHTML("<div>Hello & Welcome</div>")).toBe("&lt;div&gt;Hello &amp; Welcome&lt;/div&gt;");
  });

  test("escapes multiple occurrences of special characters", () => {
    expect(escapeHTML("<<<")).toBe("&lt;&lt;&lt;");
    expect(escapeHTML("&&&")).toBe("&amp;&amp;&amp;");
  });

  test("returns empty string for null and undefined", () => {
    expect(escapeHTML(null)).toBe("");
    expect(escapeHTML(undefined)).toBe("");
  });

  test("returns the same string for strings with no special characters", () => {
    expect(escapeHTML("HelloWorld123")).toBe("HelloWorld123");
    expect(escapeHTML(" ")).toBe(" ");
  });

  test("handles non-string inputs by converting to string and escaping", () => {
    expect(escapeHTML(123)).toBe("123");
    expect(escapeHTML(true)).toBe("true");
  });

  test("properly escapes malicious XSS payloads", () => {
    const payload = '<img src=x onerror="alert(1)">';
    const escaped = "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;";
    expect(escapeHTML(payload)).toBe(escaped);

    const scriptPayload = "<script>alert('XSS')</script>";
    const escapedScript = "&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;";
    expect(escapeHTML(scriptPayload)).toBe(escapedScript);
  });
});
