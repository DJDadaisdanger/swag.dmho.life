## 2025-03-15 - DOM-based XSS in renderWishlist
**Vulnerability:** User-controlled input in `product.name` was being rendered directly into HTML in `renderWishlist()` via `innerHTML` without escaping, resulting in a DOM-Based XSS vulnerability.
**Learning:** Even though `product.name` comes from the predefined products array in this context, it is best practice to always escape data that is dynamically inserted into HTML using `innerHTML` to defend against potential tampering or unexpected payload injection, especially when similar structures might be modified by users (e.g., shopping cart logic, custom designs).
**Prevention:** Always use an HTML escape function (`escapeHTML`) before injecting variables into template literals that are assigned to `innerHTML`, specifically for text content or HTML attributes where script execution is possible.

## 2025-03-15 - DOM-based XSS via LocalStorage
**Vulnerability:** User-controlled input (device model selection which can be edited directly or through localStorage, specifically `item.selection`, `item.name`, and `item.quantity`) was being directly rendered into HTML using template literals without any HTML escaping in `renderCart()` in `js/app.js` and in the checkout page in `js/checkout.js`.
**Learning:** Even though the data (like device model) originates from a predefined `<datalist>`, an attacker or malicious script could manually alter `localStorage` values to include XSS payloads (e.g. `<img src=x onerror=alert(1)>`). When `renderCart()` runs, the payload executes.
**Prevention:** Always HTML-escape any data coming from localStorage or any other client-side storage before rendering it into the DOM, even if the application originally sets that data from a seemingly controlled source.
