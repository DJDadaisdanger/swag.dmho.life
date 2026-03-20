import { expect, test, describe, beforeEach } from "bun:test";

let mockElements = {};

const getMockElement = (id) => {
    if (!mockElements[id]) {
        let _textContent = "";
        mockElements[id] = {
            id,
            get textContent() { return _textContent; },
            set textContent(val) { _textContent = String(val); },
            style: { display: "" },
            classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
            addEventListener: () => {},
            innerHTML: "",
            insertAdjacentHTML: () => {},
            querySelectorAll: () => [],
            querySelector: () => {
                return { addEventListener: () => {} };
            }
        };
    }
    return mockElements[id];
};

let domContentLoadedCallbacks = [];

global.document = {
    addEventListener: (event, callback) => {
        if (event === "DOMContentLoaded") {
            domContentLoadedCallbacks.push(callback);
        }
    },
    getElementById: getMockElement,
    querySelectorAll: () => [],
    querySelector: () => {
         return { addEventListener: () => {} };
    },
};

global.localStorage = {
    store: {},
    getItem: (key) => global.localStorage.store[key] || null,
    setItem: (key, value) => { global.localStorage.store[key] = value; },
};

global.window = {
    location: { href: "" }
};

// Export functions to window/global for unit testing
global.module = { exports: {} };

require("../js/app.js");

beforeEach(() => {
    mockElements = {};
    global.localStorage.store = {};
    domContentLoadedCallbacks = [];

    // Clear require cache to re-evaluate the module and re-register the event listener
    delete require.cache[require.resolve("../js/app.js")];
    require("../js/app.js");
});

describe("updateCartBadge", () => {
    test("calculates correct quantity and sets display to flex when cart has items", () => {
        global.localStorage.store['cart'] = JSON.stringify([
            { id: 1, quantity: 2, price: 10 },
            { id: 2, quantity: 3, price: 20 }
        ]);

        // Execute the DOMContentLoaded callback to set up variables and run initial updateCartBadge
        if (domContentLoadedCallbacks.length > 0) {
            domContentLoadedCallbacks[0]();

            const cartBadge = getMockElement("cartBadge");
            expect(cartBadge.textContent).toBe("5");
            expect(cartBadge.style.display).toBe("flex");
        } else {
            throw new Error("DOMContentLoaded callback not found");
        }
    });

    test("sets text content to 0 and display to none when cart is empty", () => {
        global.localStorage.store['cart'] = JSON.stringify([]);

        // Execute the DOMContentLoaded callback to set up variables and run initial updateCartBadge
        if (domContentLoadedCallbacks.length > 0) {
            domContentLoadedCallbacks[0]();

            const cartBadge = getMockElement("cartBadge");
            expect(cartBadge.textContent).toBe("0");
            expect(cartBadge.style.display).toBe("none");
        } else {
             throw new Error("DOMContentLoaded callback not found");
        }
    });
});
