import { expect, test, beforeEach, describe } from "bun:test";

let domContentLoadedCallback = null;
let mockElements = {};
let mockLocalStorage = {};

function createElementMock(tag) {
  return {
    tag,
    textContent: '',
    children: [],
    classList: {
      classes: new Set(),
      add: function(cls) { this.classes.add(cls); }
    },
    appendChild: function(child) { this.children.push(child); },
    listeners: {},
    addEventListener: function(evt, cb) {
      this.listeners[evt] = cb;
    }
  };
}

global.window = {
  location: { href: '' }
};

global.localStorage = {
  getItem: (key) => mockLocalStorage[key] || null,
  setItem: (key, value) => { mockLocalStorage[key] = value; }
};

global.document = {
  addEventListener: (event, callback) => {
    if (event === 'DOMContentLoaded') {
      domContentLoadedCallback = callback;
    }
  },
  getElementById: (id) => mockElements[id] || null,
  querySelector: (selector) => mockElements[selector] || null,
  createElement: createElementMock
};

// Require the checkout file
require("../js/checkout.js");

describe("Checkout Logic", () => {
  beforeEach(() => {
    mockElements = {
      'summary-items': createElementMock('div'),
      'summary-total': createElementMock('span'),
      '.back-to-shop-btn': createElementMock('button')
    };
    mockLocalStorage = {};
    global.window.location.href = '';
  });

  test("should render empty message when cart is empty", () => {
    mockLocalStorage['cart'] = JSON.stringify([]);
    domContentLoadedCallback();

    const summaryItems = mockElements['summary-items'];
    expect(summaryItems.children.length).toBe(1);
    expect(summaryItems.children[0].textContent).toBe('Your cart is empty.');
  });

  test("should render empty message when cart is not in localStorage", () => {
    // mockLocalStorage['cart'] is undefined
    domContentLoadedCallback();

    const summaryItems = mockElements['summary-items'];
    expect(summaryItems.children.length).toBe(1);
    expect(summaryItems.children[0].textContent).toBe('Your cart is empty.');
  });

  test("should render items and total when cart has items", () => {
    mockLocalStorage['cart'] = JSON.stringify([
      { name: 'Item 1', quantity: 2, price: 50 },
      { name: 'Item 2', quantity: 1, price: 100 }
    ]);
    domContentLoadedCallback();

    const summaryItems = mockElements['summary-items'];
    const summaryTotal = mockElements['summary-total'];

    expect(summaryItems.children.length).toBe(2);

    const item1 = summaryItems.children[0];
    expect(item1.classList.classes.has('order-item')).toBe(true);
    expect(item1.classList.classes.has('summary-item')).toBe(true);
    expect(item1.children[0].textContent).toBe('Item 1 x 2');
    expect(item1.children[1].textContent).toBe('₹100.00');

    const item2 = summaryItems.children[1];
    expect(item2.children[0].textContent).toBe('Item 2 x 1');
    expect(item2.children[1].textContent).toBe('₹100.00');

    expect(summaryTotal.textContent).toBe('₹200.00');
  });

  test("should setup back to shop button listener", () => {
    domContentLoadedCallback();

    const backBtn = mockElements['.back-to-shop-btn'];
    expect(backBtn.listeners['click']).toBeDefined();

    let preventDefaultCalled = false;
    const mockEvent = {
      preventDefault: () => { preventDefaultCalled = true; }
    };

    backBtn.listeners['click'](mockEvent);

    expect(preventDefaultCalled).toBe(true);
    expect(global.window.location.href).toBe('index.html');
  });

  test("should handle missing DOM elements safely", () => {
    mockElements = {}; // No DOM elements found
    mockLocalStorage['cart'] = JSON.stringify([{ name: 'Item 1', quantity: 1, price: 50 }]);

    // This shouldn't throw an error
    expect(() => domContentLoadedCallback()).not.toThrow();
  });
});
