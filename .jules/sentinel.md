## 2025-03-15 - DOM-based XSS in renderWishlist
**Vulnerability:** User-controlled input in `product.name` was being rendered directly into HTML in `renderWishlist()` via `innerHTML` without escaping, resulting in a DOM-Based XSS vulnerability.
**Learning:** Even though `product.name` comes from the predefined products array in this context, it is best practice to always escape data that is dynamically inserted into HTML using `innerHTML` to defend against potential tampering or unexpected payload injection, especially when similar structures might be modified by users (e.g., shopping cart logic, custom designs).
**Prevention:** Always use an HTML escape function (`escapeHTML`) before injecting variables into template literals that are assigned to `innerHTML`, specifically for text content or HTML attributes where script execution is possible.

## 2025-03-15 - DOM-based XSS via LocalStorage
**Vulnerability:** User-controlled input (device model selection which can be edited directly or through localStorage, specifically `item.selection`, `item.name`, and `item.quantity`) was being directly rendered into HTML using template literals without any HTML escaping in `renderCart()` in `js/app.js` and in the checkout page in `js/checkout.js`.
**Learning:** Even though the data (like device model) originates from a predefined `<datalist>`, an attacker or malicious script could manually alter `localStorage` values to include XSS payloads (e.g. `<img src=x onerror=alert(1)>`). When `renderCart()` runs, the payload executes.
**Prevention:** Always HTML-escape any data coming from localStorage or any other client-side storage before rendering it into the DOM, even if the application originally sets that data from a seemingly controlled source.

## 2026-03-20 - DOM-based XSS via innerHTML in app.js
**Vulnerability:** User-controlled inputs or dynamic variables (e.g., `product.name`, `item1.name`, `item2.name`) retrieved from variables or potentially external data sources were interpolated directly into `innerHTML` strings without being HTML-escaped in the root `app.js`.
**Learning:** `innerHTML` executes inline scripts and processes HTML tags natively. Injecting unsanitized input into `innerHTML` makes the application highly susceptible to DOM-based Cross-Site Scripting (XSS).
**Prevention:** Always sanitize and HTML-escape any external or user-influenced data (e.g., via a helper like `escapeHTML`) before interpolating it into DOM elements. For elements consisting strictly of text, use `textContent` rather than `innerHTML` to inherently treat inputs as plain text instead of executable HTML.
# 🛡️ Sentinel Security Log

## [2026-03-17] DOM-based XSS in checkout.js

- **Vulnerability**: DOM-based XSS via `innerHTML` in `js/checkout.js`.
- **Learning**: Even when escaping input, using `innerHTML` to render user-controlled data is risky and less secure than using `textContent` or manual DOM node construction.
- **Prevention**: Always prefer `textContent` and `document.createElement` when rendering dynamic content retrieved from `localStorage` or other user-controlled sources.
### DOM-based XSS in innerHTML
- **Vulnerability:** Interpolating untrusted/un-escaped variables directly into `innerHTML` allows for Cross-Site Scripting (XSS).
- **Solution:** Always escape dynamic values using a utility like `escapeHTML` prior to interpolation, or use safer properties like `textContent`.
