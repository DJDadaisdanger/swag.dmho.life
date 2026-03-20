# 🛡️ Sentinel Security Log

## [2026-03-17] DOM-based XSS in checkout.js

- **Vulnerability**: DOM-based XSS via `innerHTML` in `js/checkout.js`.
- **Learning**: Even when escaping input, using `innerHTML` to render user-controlled data is risky and less secure than using `textContent` or manual DOM node construction.
- **Prevention**: Always prefer `textContent` and `document.createElement` when rendering dynamic content retrieved from `localStorage` or other user-controlled sources.
