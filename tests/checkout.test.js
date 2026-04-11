import { expect, test, beforeEach, describe, mock } from "bun:test";

describe("Checkout JS Tests", () => {
    let domContentLoadedCallback;
    let localStorageData;
    let createdElements;

    beforeEach(() => {
        domContentLoadedCallback = null;
        localStorageData = {};
        createdElements = [];

        global.window = {
            location: {
                href: ''
            }
        };

        global.localStorage = {
            getItem: mock((key) => localStorageData[key] || null),
            setItem: mock((key, value) => { localStorageData[key] = value.toString(); }),
            removeItem: mock((key) => { delete localStorageData[key]; })
        };

        global.MockElement = class MockElement {
            constructor(tagName) {
                this.tagName = tagName;
                this.textContent = '';
                this.children = [];
                this.classList = {
                    classes: [],
                    add: function(cls) { this.classes.push(cls); }
                };
            }
            appendChild(child) {
                this.children.push(child);
            }
            addEventListener(event, callback) {
                this[`on${event}`] = callback;
            }
        };

        global.document = {
            getElementById: mock((id) => {
                const el = new MockElement('div');
                el.id = id;
                return el;
            }),
            querySelector: mock((selector) => {
                const el = new MockElement('button');
                el.className = selector;
                return el;
            }),
            createElement: mock((tagName) => {
                const el = new MockElement(tagName);
                createdElements.push(el);
                return el;
            }),
            addEventListener: mock((event, callback) => {
                if (event === 'DOMContentLoaded') {
                    domContentLoadedCallback = callback;
                }
            })
        };
    });

    test("Registers DOMContentLoaded listener", () => {
        // Need to delete require cache so it re-registers the listener
        delete require.cache[require.resolve("../js/checkout.js")];
        require("../js/checkout.js");
        expect(domContentLoadedCallback).not.toBeNull();
    });

    test("Handles empty cart gracefully", () => {
        delete require.cache[require.resolve("../js/checkout.js")];
        require("../js/checkout.js");

        let getElementByIdCalls = [];
        global.document.getElementById = mock((id) => {
            const el = new global.MockElement('div');
            el.id = id;
            getElementByIdCalls.push(el);
            return el;
        });

        domContentLoadedCallback();

        expect(global.localStorage.getItem).toHaveBeenCalledWith('cart');

        const summaryItems = getElementByIdCalls.find(e => e.id === 'summary-items');
        expect(summaryItems).toBeDefined();

        expect(summaryItems.children.length).toBe(1);
        expect(summaryItems.children[0].tagName).toBe('p');
        expect(summaryItems.children[0].textContent).toBe('Your cart is empty.');
    });

    test("Handles missing localStorage cart item", () => {
        global.localStorage.getItem = mock(() => null);

        delete require.cache[require.resolve("../js/checkout.js")];
        require("../js/checkout.js");

        let getElementByIdCalls = [];
        global.document.getElementById = mock((id) => {
            const el = new global.MockElement('div');
            el.id = id;
            getElementByIdCalls.push(el);
            return el;
        });

        domContentLoadedCallback();

        const summaryItems = getElementByIdCalls.find(e => e.id === 'summary-items');
        expect(summaryItems.children[0].textContent).toBe('Your cart is empty.');
    });

    test("Renders multiple cart items and calculates sum correctly", () => {
        const cartData = [
            { name: "Item 1", price: 10, quantity: 2 },
            { name: "Item 2", price: 5, quantity: 1 }
        ];
        global.localStorage.getItem = mock(() => JSON.stringify(cartData));

        delete require.cache[require.resolve("../js/checkout.js")];
        require("../js/checkout.js");

        let getElementByIdCalls = [];
        global.document.getElementById = mock((id) => {
            const el = new MockElement('div');
            el.id = id;
            getElementByIdCalls.push(el);
            return el;
        });

        domContentLoadedCallback();

        const summaryItems = getElementByIdCalls.find(e => e.id === 'summary-items');
        const summaryTotal = getElementByIdCalls.find(e => e.id === 'summary-total');

        expect(summaryItems).toBeDefined();
        expect(summaryItems.children.length).toBe(2);

        // First item checks
        const firstItem = summaryItems.children[0];
        expect(firstItem.tagName).toBe('div');
        expect(firstItem.classList.classes).toContain('order-item');
        expect(firstItem.classList.classes).toContain('summary-item');
        expect(firstItem.children[0].textContent).toBe('Item 1 x 2');
        expect(firstItem.children[1].textContent).toBe('₹20.00');

        // Second item checks
        const secondItem = summaryItems.children[1];
        expect(secondItem.children[0].textContent).toBe('Item 2 x 1');
        expect(secondItem.children[1].textContent).toBe('₹5.00');

        // Total checks
        expect(summaryTotal.textContent).toBe('₹25.00');
    });

    test("Simulates back to shop button click", () => {
        delete require.cache[require.resolve("../js/checkout.js")];
        require("../js/checkout.js");

        let backBtn;
        global.document.querySelector = mock((selector) => {
            backBtn = new global.MockElement('button');
            backBtn.className = selector;
            return backBtn;
        });

        domContentLoadedCallback();

        expect(backBtn).toBeDefined();

        let preventDefaultCalled = false;
        const event = {
            preventDefault: () => { preventDefaultCalled = true; }
        };

        backBtn.onclick(event);

        expect(preventDefaultCalled).toBe(true);
        expect(global.window.location.href).toBe('index.html');
    });

    test("Handles missing DOM elements safely", () => {
        global.document.getElementById = mock(() => null);
        global.document.querySelector = mock(() => null);

        const cartData = [
            { name: "Item 1", price: 10, quantity: 2 }
        ];
        global.localStorage.getItem = mock(() => JSON.stringify(cartData));

        delete require.cache[require.resolve("../js/checkout.js")];
        require("../js/checkout.js");

        // Should not throw error
        expect(() => {
            domContentLoadedCallback();
        }).not.toThrow();
    });
});
