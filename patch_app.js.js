const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');

// We need to add logic for login prompt and saving cart/wishlist to localStorage
// Find variable declarations
const varDeclMatch = `let wishlist = [];
    let cart = [];
    let activeCategory = 'all';
    let activeTag = 'all';`;

const varDeclReplace = `let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let activeCategory = 'all';
    let activeTag = 'all';
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let hasSeenLoginPrompt = localStorage.getItem('hasSeenLoginPrompt') === 'true';

    // TODO: [Backend Integration] Integrate OAuth 2.0 to handle authentication securely and store session tokens
    // instead of local dummy variables. User data (cart/wishlist) should be fetched from the SQLite database
    // upon successful login via the Python backend.`;

content = content.replace(varDeclMatch, varDeclReplace);

const promptLogic = `
    function showLoginPrompt(onLogin, onNvm) {
        if (isLoggedIn || hasSeenLoginPrompt) {
            onNvm();
            return;
        }

        const modalHtml = \`
            <div class="modal open" id="loginPromptModal" style="z-index: 5000;">
                <div class="modal-content" style="max-width: 400px; text-align: center; padding: 2rem;">
                    <h2 style="margin-bottom: 1rem;">Save Your Progress</h2>
                    <p style="margin-bottom: 2rem; color: #888;">You must login to save your wishlist and cart securely.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="nvmBtn" style="background: #1a1a1a; color: #eeeeee; border: 1px solid #2a2a2a; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Nvm</button>
                        <button id="loginBtn" style="background: #3b82f6; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Login</button>
                    </div>
                </div>
            </div>
        \`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('loginPromptModal');

        document.getElementById('nvmBtn').addEventListener('click', () => {
            modal.remove();
            hasSeenLoginPrompt = true;
            localStorage.setItem('hasSeenLoginPrompt', 'true');
            onNvm();
        });

        document.getElementById('loginBtn').addEventListener('click', () => {
            modal.remove();
            isLoggedIn = true;
            hasSeenLoginPrompt = true;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('hasSeenLoginPrompt', 'true');
            onLogin();
        });
    }

    function saveState() {
        // TODO: [Backend Integration] Sync cart and wishlist with Python backend / SQLite DB here.
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
`;

const renderProductsMatch = `function renderProducts() {`;
content = content.replace(renderProductsMatch, promptLogic + '\n    ' + renderProductsMatch);

// Update toggleWishlist
const toggleWishlistMatch = `function toggleWishlist(productId, btn) {
        const index = wishlist.indexOf(productId);
        if (index > -1) {
            wishlist.splice(index, 1);
            btn.classList.remove('active');
        } else {
            wishlist.push(productId);
            btn.classList.add('active');
        }
        updateWishlistBadge();
        renderWishlist();
    }`;

const toggleWishlistReplace = `function toggleWishlist(productId, btn) {
        const index = wishlist.indexOf(productId);

        const action = () => {
            if (index > -1) {
                wishlist.splice(index, 1);
                btn.classList.remove('active');
            } else {
                wishlist.push(productId);
                btn.classList.add('active');
            }
            saveState();
            updateWishlistBadge();
            renderWishlist();
        };

        if (index === -1 && wishlist.length === 0 && cart.length === 0) {
            showLoginPrompt(action, action);
        } else {
            action();
        }
    }`;
content = content.replace(toggleWishlistMatch, toggleWishlistReplace);

// Update addToCart
const addToCartMatch = `function addToCart(productId, selection, quantity) {
        const existingItem = cart.find(item => item.id === productId && item.selection === selection);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id: productId, selection, quantity });
        }
        updateCartBadge();
        renderCart();
    }`;

const addToCartReplace = `function addToCart(productId, selection, quantity) {
        const action = () => {
            const existingItem = cart.find(item => item.id === productId && item.selection === selection);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ id: productId, selection, quantity });
            }
            saveState();
            updateCartBadge();
            renderCart();
        };

        if (cart.length === 0 && wishlist.length === 0) {
            showLoginPrompt(action, action);
        } else {
            action();
        }
    }`;
content = content.replace(addToCartMatch, addToCartReplace);


// Handle removing items to call saveState
content = content.replace(`cart = cart.filter(item => !(item.id === productId && item.selection === selection));
            renderCart();
            updateCartBadge();`, `cart = cart.filter(item => !(item.id === productId && item.selection === selection));
            saveState();
            renderCart();
            updateCartBadge();`);

content = content.replace(`if (item.quantity > 1) {
                item.quantity--;
                renderCart();
                updateCartBadge();
            }`, `if (item.quantity > 1) {
                item.quantity--;
                saveState();
                renderCart();
                updateCartBadge();
            }`);

content = content.replace(`item.quantity++;
            renderCart();
            updateCartBadge();`, `item.quantity++;
            saveState();
            renderCart();
            updateCartBadge();`);


// In renderWishlist and renderCart, remove "Sign in to save" buttons since we handle it.
// Also update wishlistBadge and cartBadge logic to handle page load.
content = content.replace(`updateWishlistBadge();
    updateCartBadge();`, `updateWishlistBadge();
    updateCartBadge();`);
// Wait they are not called on init directly, they are updated in toggleWishlist. I'll add them at the bottom.

const renderCallsMatch = `renderProducts();
    renderCart();
    renderWishlist();
    renderCouples();`;

const renderCallsReplace = `renderProducts();
    renderCart();
    renderWishlist();
    renderCouples();
    updateCartBadge();
    updateWishlistBadge();`;

content = content.replace(renderCallsMatch, renderCallsReplace);

fs.writeFileSync('app.js', content);
