import { expect, test, describe, beforeEach } from "bun:test";

// Robust mock for document and other browser globals
const mockDocument = {
  cookie: "",
  addEventListener: () => {},
  getElementById: (id) => ({
      addEventListener: () => {},
      textContent: "",
      style: {},
      innerHTML: "",
      insertAdjacentHTML: () => {},
      closest: () => ({ dataset: {} }),
      querySelectorAll: () => [],
      querySelector: () => null,
      dataset: {},
      value: "",
      remove: () => {},
      classList: {
          add: () => {},
          remove: () => {},
          toggle: () => {},
          contains: () => false
      }
  }),
  querySelectorAll: () => [],
  querySelector: () => null,
  body: {
      insertAdjacentHTML: () => {},
      innerHTML: ""
  }
};

global.document = mockDocument;
global.window = {
  location: { href: "" },
  addEventListener: () => {}
};
global.Date = Date;
global.decodeURIComponent = decodeURIComponent;
global.encodeURIComponent = encodeURIComponent;

const { getCookie } = require("../js/app.js");

describe("getCookie", () => {
  beforeEach(() => {
    // Reset mock document.cookie
    global.document.cookie = "";
  });

  test("should return empty string if cookie does not exist", () => {
    document.cookie = "other=value";
    expect(getCookie("test")).toBe("");
  });

  test("should return cookie value if it exists", () => {
    document.cookie = "test=value";
    expect(getCookie("test")).toBe("value");
  });

  test("should handle multiple cookies", () => {
    document.cookie = "other=value; test=expected; third=another";
    expect(getCookie("test")).toBe("expected");
  });

  test("should handle cookies with leading spaces in the string", () => {
    document.cookie = " other=value;test=expected";
    expect(getCookie("test")).toBe("expected");
  });

  test("should handle trailing spaces in individual cookie parts correctly (Original behavior doesn't trim result)", () => {
    document.cookie = "other=value; test=expected ; third=another";
    // The original code was: return c.substring(cname.length, c.length);
    // When c = " test=expected ", c.indexOf("test=") is 1 (if it doesn't have a space)
    // Wait, let's trace:
    // "other=value; test=expected ; third=another".split(";") -> ["other=value", " test=expected ", " third=another"]
    // i=0: c="other=value", no match
    // i=1: c=" test=expected ", leading space is removed -> c="test=expected "
    // c.indexOf("test=") is 0.
    // cname.length is 5.
    // c.substring(5, 14) is "expected ".
    expect(getCookie("test")).toBe("expected ");
  });

  test("should decode cookie value", () => {
    document.cookie = "test=" + encodeURIComponent("value with spaces");
    expect(getCookie("test")).toBe("value with spaces");
  });

  test("should return first match if multiple cookies with same name exist", () => {
      document.cookie = "test=first; test=second";
      expect(getCookie("test")).toBe("first");
  });

  test("should handle empty cookie string", () => {
      document.cookie = "";
      expect(getCookie("test")).toBe("");
  });
});
