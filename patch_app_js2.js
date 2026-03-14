const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const rmvFix = `cart = cart.filter(item => !(item.id === productId && item.selection === selection));
            renderCart();
            updateCartBadge();`;
content = content.replace(rmvFix, `cart = cart.filter(item => !(item.id === productId && item.selection === selection));
            saveState();
            renderCart();
            updateCartBadge();`);

const addToCartFix1 = `if (item.quantity > 1) {
                item.quantity--;
                renderCart();
                updateCartBadge();
            }`;
content = content.replace(addToCartFix1, `if (item.quantity > 1) {
                item.quantity--;
                saveState();
                renderCart();
                updateCartBadge();
            }`);

const addToCartFix2 = `item.quantity++;
            renderCart();
            updateCartBadge();`;
content = content.replace(addToCartFix2, `item.quantity++;
            saveState();
            renderCart();
            updateCartBadge();`);

const initCallsMatch = `renderProducts();
    renderCart();
    renderWishlist();
    renderCouples();`;
content = content.replace(initCallsMatch, `renderProducts();
    renderCart();
    renderWishlist();
    renderCouples();
    updateCartBadge();
    updateWishlistBadge();`);

fs.writeFileSync('app.js', content);
