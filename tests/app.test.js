import { expect, test, beforeEach, afterEach, describe } from "bun:test";

// Mock globals
global.window = {};
global.document = {
  _cookie: "",
  get cookie() {
    return this._cookie;
  },
  set cookie(val) {
    this._cookie = val;
  },
  addEventListener: () => {}
};
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

let store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = value.toString(); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { store = {}; }
};

// Require the app file
const { setCookie, getCookie, BackendAPI } = require("../js/app.js");

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

describe("BackendAPI.getUserData", () => {
  const { BackendAPI } = require("../js/app.js");

  beforeEach(() => {
    global.document.cookie = "";
    global.localStorage.clear();
  });

  test("should return default empty values when no data is stored", async () => {
    const data = await BackendAPI.getUserData();
    expect(data.wishlist).toEqual([]);
    expect(data.cart).toEqual([]);
    expect(data.isLoggedIn).toBe(false);
    expect(data.hasSeenLoginPrompt).toBe(false);
  });

  test("should load wishlist and cart from localStorage", async () => {
    const mockWishlist = [{ id: "prod1" }];
    const mockCart = [{ id: "prod2", qty: 2 }];

    global.localStorage.setItem("wishlist", JSON.stringify(mockWishlist));
    global.localStorage.setItem("cart", JSON.stringify(mockCart));

    const data = await BackendAPI.getUserData();
    expect(data.wishlist).toEqual(mockWishlist);
    expect(data.cart).toEqual(mockCart);
  });

  test("should fallback to cookies if localStorage returns null", async () => {
    const mockWishlist = [{ id: "prod3" }];
    const mockCart = [{ id: "prod4", qty: 1 }];

    // Set cookies manually instead of using setCookie to avoid dependencies in the test setup
    global.document.cookie = `wishlist=${encodeURIComponent(JSON.stringify(mockWishlist))}; cart=${encodeURIComponent(JSON.stringify(mockCart))}`;

    const data = await BackendAPI.getUserData();
    expect(data.wishlist).toEqual(mockWishlist);
    expect(data.cart).toEqual(mockCart);
  });

  test("should properly read boolean flags from cookies", async () => {
    global.document.cookie = "isLoggedIn=true; hasSeenLoginPrompt=true";

    const data = await BackendAPI.getUserData();
    expect(data.isLoggedIn).toBe(true);
    expect(data.hasSeenLoginPrompt).toBe(true);
  });

  test("should handle invalid JSON data gracefully", async () => {
    global.localStorage.setItem("wishlist", "invalid-json");
    global.localStorage.setItem("cart", "{ bad json");

    // Mock console.error to prevent it from cluttering the test output
    const originalConsoleError = console.error;
    let errorCalled = false;
    console.error = (msg, e) => {
      errorCalled = true;
    };

    try {
      const data = await BackendAPI.getUserData();

      expect(data.wishlist).toEqual([]);
      expect(data.cart).toEqual([]);
      expect(errorCalled).toBe(true);
    } finally {
      // Restore console.error
      console.error = originalConsoleError;
    }
  });
});

describe("BackendAPI.syncData", () => {
  const { BackendAPI } = require("../js/app.js");

  beforeEach(() => {
    global.document.cookie = "";
    global.localStorage.clear();

    // Mock global fetch
    global.originalFetch = global.fetch;
    global.fetch = async () => {};
    global.fetchCalled = false;
    global.fetchArgs = null;
  });

  afterEach(() => {
    // Clean up
    if (global.originalFetch) {
      global.fetch = global.originalFetch;
      delete global.originalFetch;
    }
    delete global.fetchCalled;
    delete global.fetchArgs;
  });

  test("should store cart and wishlist in localStorage and cookies", async () => {
    const mockCart = [{ id: 1, quantity: 2 }];
    const mockWishlist = [3, 4];

    // We mock setCookie behavior here by tracking set cookie string
    let cookieStrings = [];
    const originalDocument = global.document;
    global.document = Object.create(originalDocument);
    Object.defineProperty(global.document, 'cookie', {
      set(val) { cookieStrings.push(val); },
      get() { return ""; }
    });

    await BackendAPI.syncData(mockCart, mockWishlist, false);

    expect(global.localStorage.getItem("cart")).toBe(JSON.stringify(mockCart));
    expect(global.localStorage.getItem("wishlist")).toBe(JSON.stringify(mockWishlist));

    expect(cookieStrings.some(c => c.startsWith("cart=" + encodeURIComponent(JSON.stringify(mockCart))))).toBe(true);
    expect(cookieStrings.some(c => c.startsWith("wishlist=" + encodeURIComponent(JSON.stringify(mockWishlist))))).toBe(true);

    global.document = originalDocument;
  });

  test("should not call fetch when isLoggedIn is false", async () => {
    let fetchCalled = false;
    global.fetch = async () => { fetchCalled = true; };

    await BackendAPI.syncData([], [], false);

    expect(fetchCalled).toBe(false);
  });

  test("should call fetch with correct parameters when isLoggedIn is true", async () => {
    let fetchArgs = null;
    global.fetch = async (url, options) => {
      fetchArgs = { url, options };
    };

    const mockCart = [{ id: 1, quantity: 2 }];
    const mockWishlist = [3, 4];

    await BackendAPI.syncData(mockCart, mockWishlist, true);

    expect(fetchArgs).not.toBeNull();
    expect(fetchArgs.url).toBe("/api/sync");
    expect(fetchArgs.options.method).toBe("POST");
    expect(fetchArgs.options.headers["Content-Type"]).toBe("application/json");
    expect(fetchArgs.options.body).toBe(JSON.stringify({ cart: mockCart, wishlist: mockWishlist }));
  });

  test("should catch and log error if fetch fails", async () => {
    const mockError = new Error("Network failure");
    global.fetch = async () => {
      throw mockError;
    };

    const originalConsoleError = console.error;
    let errorLog = null;
    console.error = (msg, err) => {
      errorLog = { msg, err };
    };

    try {
      await BackendAPI.syncData([], [], true);

      expect(errorLog).not.toBeNull();
      expect(errorLog.msg).toBe("Error syncing state with backend:");
      expect(errorLog.err).toBe(mockError);
    } finally {
      console.error = originalConsoleError;
    }
  });
});
