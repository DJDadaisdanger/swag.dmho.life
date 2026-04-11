import { expect, test, beforeEach, describe, mock } from "bun:test";

let domContentLoadedCallback = null;

class MockElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.classList = {
            add: mock()
        };
        this.children = [];
        this.textContent = '';
        this.listeners = {};
    }
    appendChild(child) {
        this.children.push(child);
    }
    addEventListener(event, callback) {
        this.listeners[event] = callback;
    }
    click(e) {
        if (this.listeners['click']) {
            this.listeners['click'](e || { preventDefault: () => {} });
        }
    }
}

global.window = {
    location: { href: '' }
};

global.document = {
    addEventListener: (event, callback) => {
        if (event === 'DOMContentLoaded') {
            domContentLoadedCallback = callback;
        }
    },
    createElement: (tagName) => new MockElement(tagName),
    getElementById: () => null,
    querySelector: () => null,
};

global.localStorage = {
    getItem: mock(() => null)
};

// Require the file
require("../js/checkout.js");

describe("checkout.js", () => {
    let mockOrderItems;
    let mockTotalPrice;
    let mockBackBtn;

    beforeEach(() => {
        mockOrderItems = new MockElement('div');
        mockTotalPrice = new MockElement('span');
        mockBackBtn = new MockElement('button');

        global.window.location.href = '';
        global.document.getElementById = mock((id) => {
            if (id === 'summary-items') return mockOrderItems;
            if (id === 'summary-total') return mockTotalPrice;
            return null;
        });
        global.document.querySelector = mock((selector) => {
            if (selector === '.back-to-shop-btn') return mockBackBtn;
            return null;
        });
        global.localStorage.getItem = mock(() => null);
    });

    test("handles empty cart", () => {
        global.localStorage.getItem.mockReturnValue(null);
        domContentLoadedCallback();

        expect(global.localStorage.getItem).toHaveBeenCalledWith('cart');
        expect(mockOrderItems.children.length).toBe(1);
        expect(mockOrderItems.children[0].tagName).toBe('p');
        expect(mockOrderItems.children[0].textContent).toBe('Your cart is empty.');
    });

    test("handles cart with items", () => {
        const cartData = [
            { name: "Item 1", price: 10, quantity: 2 },
            { name: "Item 2", price: 5, quantity: 1 }
        ];
        global.localStorage.getItem.mockReturnValue(JSON.stringify(cartData));

        domContentLoadedCallback();

        expect(mockOrderItems.children.length).toBe(2);

        // Check first item
        const item1 = mockOrderItems.children[0];
        expect(item1.tagName).toBe('div');
        expect(item1.classList.add).toHaveBeenCalledWith('order-item');
        expect(item1.classList.add).toHaveBeenCalledWith('summary-item');
        expect(item1.children.length).toBe(2); // nameSpan, priceSpan
        expect(item1.children[0].textContent).toBe('Item 1 x 2');
        expect(item1.children[1].textContent).toBe('₹20.00'); // 10 * 2

        // Check second item
        const item2 = mockOrderItems.children[1];
        expect(item2.children[0].textContent).toBe('Item 2 x 1');
        expect(item2.children[1].textContent).toBe('₹5.00'); // 5 * 1

        expect(mockTotalPrice.textContent).toBe('₹25.00'); // 20 + 5
    });

    test("back to shop button works", () => {
        global.localStorage.getItem.mockReturnValue(null);
        domContentLoadedCallback();

        let preventDefaultCalled = false;
        mockBackBtn.click({ preventDefault: () => { preventDefaultCalled = true; } });

        expect(preventDefaultCalled).toBe(true);
        expect(global.window.location.href).toBe('index.html');
    });

    test("does not crash if elements are missing", () => {
        global.document.getElementById.mockReturnValue(null);
        global.document.querySelector.mockReturnValue(null);

        // Should not throw
        expect(() => {
            domContentLoadedCallback();
        }).not.toThrow();
    });
});