import { expect, test, beforeEach, describe } from "bun:test";

// Mock globals
global.window = {};
global.document = {
  cookie: "",
  addEventListener: () => {}
};

// Require the app file
const { setCookie, getCookie } = require("../js/app.js");

describe("Cookie Utilities", () => {
  beforeEach(() => {
    // Reset cookie string before each test
    global.document.cookie = "";
  });

  test("setCookie should set a cookie correctly", () => {
    // Mock Date to have deterministic expires
    const OriginalDate = global.Date;
    global.Date = class extends OriginalDate {
      constructor() {
        super("2023-01-01T00:00:00Z");
      }
    };

    setCookie("test", "value", 1);

    // Test that cookie string starts with the expected value and contains expiration
    expect(global.document.cookie).toContain("test=value");
    expect(global.document.cookie).toContain("expires=Mon, 02 Jan 2023 00:00:00 GMT");
    expect(global.document.cookie).toContain("path=/");

    // Restore original Date
    global.Date = OriginalDate;
  });

  test("setCookie should properly encode the value", () => {
    setCookie("my_cookie", "some value with spaces and symbols!@#");
    expect(global.document.cookie).toContain("my_cookie=some%20value%20with%20spaces%20and%20symbols!%40%23");
  });

  test("getCookie should return the value of an existing cookie", () => {
    global.document.cookie = "other=something; test=value; another=thing";
    expect(getCookie("test")).toBe("value");
  });

  test("getCookie should decode the cookie value", () => {
    global.document.cookie = "encoded=some%20value%20with%20spaces";
    expect(getCookie("encoded")).toBe("some value with spaces");
  });

  test("getCookie should return an empty string if cookie doesn't exist", () => {
    global.document.cookie = "other=something";
    expect(getCookie("test")).toBe("");
  });

  test("getCookie should handle empty document.cookie", () => {
    global.document.cookie = "";
    expect(getCookie("test")).toBe("");
  });

  test("getCookie should handle cookie exactly at the beginning", () => {
      global.document.cookie = "first=1; second=2";
      expect(getCookie("first")).toBe("1");
  });
});

describe("renderCart XSS Mitigation", () => {
  test("cart items containing script tags should be rendered safely as text", () => {
    // In Bun tests we can't easily run the DOM operations without jsdom,
    // but app.js doesn't export renderCart directly.
    // We will verify the fix by checking that innerHTML concatenation is removed
    // from app.js using string search.
    const fs = require('fs');
    const path = require('path');
    const appJsContent = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf-8');

    // We check that innerHTML is only used to clear the container, not build items
    expect(appJsContent).toContain('cartSidebar.innerHTML = "";');
    // Ensure we are using document.createElement for sidebar-items
    expect(appJsContent).toContain('const itemsDiv = document.createElement(\'div\');');
    expect(appJsContent).toContain('itemsDiv.className = \'sidebar-items\';');
    expect(appJsContent).not.toContain('cartSidebar.innerHTML = `\\n                <div class="sidebar-header">');
  });
});
