
const products = [
    {
        id: 1,
        name: 'Brainrot',
        price: 19.99,
        image: 'assets/brainrot.svg',
        category: 'T-Shirts',
        tags: ['crazy', 'design'],
    },
    {
        id: 2,
        name: 'Couple Goals',
        price: 29.99,
        image: 'assets/couple goals.svg',
        category: 'T-Shirts',
        tags: ['couplegoals'],
    },
    {
        id: 3,
        name: 'Intellactual',
        price: 24.99,
        image: 'assets/intellactual.svg',
        category: 'T-Shirts',
        tags: ['intellectual', 'design'],
    },
    {
        id: 4,
        name: 'Mug',
        price: 14.99,
        image: 'assets/mug.svg',
        category: 'Mugs',
        tags: ['nerdy', 'design'],
    },
    {
        id: 5,
        name: 'Nerdy',
        price: 22.99,
        image: 'assets/nerdy.svg',
        category: 'T-Shirts',
        tags: ['nerdy', 'design'],
    },
    {
        id: 6,
        name: 'Robo',
        price: 27.99,
        image: 'assets/robo.svg',
        category: 'T-Shirts',
        tags: ['nerdy', 'design'],
    },
    {
        id: 7,
        name: 'T Sherting',
        price: 19.99,
        image: 'assets/t sherting.svg',
        category: 'T-Shirts',
        tags: ['intellectual', 'design'],
    },
    {
        id: 8,
        name: 'Cute Cover',
        price: 39.99,
        image: 'assets/covers/cute.svg',
        category: 'Phone Covers',
        tags: ['cute', 'design'],
    },
    {
        id: 9,
        name: 'Pair A Cover',
        price: 45.99,
        image: 'assets/covers/pair A.svg',
        category: 'Phone Covers',
        tags: ['couplegoals', 'design'],
    },
    {
        id: 10,
        name: 'Totem Cover',
        price: 42.99,
        image: 'assets/covers/totem.svg',
        category: 'Phone Covers',
        tags: ['spiritual', 'design'],
    },
    {
        id: 11,
        name: 'Cute iPad Cover',
        price: 59.99,
        image: 'assets/covers/cute.svg',
        category: 'iPad Covers',
        tags: ['cute', 'design'],
    },
    {
        id: 12,
        name: 'Pair A iPad Cover',
        price: 65.99,
        image: 'assets/covers/pair A.svg',
        category: 'iPad Covers',
        tags: ['couplegoals', 'design'],
    },
    {
        id: 13,
        name: 'Totem iPad Cover',
        price: 62.99,
        image: 'assets/covers/totem.svg',
        category: 'iPad Covers',
        tags: ['spiritual', 'design'],
    },
];

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productsGrid');
    const filterTags = document.querySelectorAll('.filter-tag');
    const categoryFilters = document.querySelectorAll('.category-filter');
    const wishlistBadge = document.getElementById('wishlistBadge');
    const cartBadge = document.getElementById('cartBadge');
    const cartBtn = document.getElementById('cartBtn');
    const wishlistBtn = document.getElementById('wishlistBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const productModal = document.getElementById('productModal');

    let wishlist = [];
    let cart = [];
    let activeCategory = 'all';
    let activeTag = 'all';

    function renderProducts() {
        productsGrid.innerHTML = '';
        const filteredProducts = products.filter(product => {
            const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
            const tagMatch = activeTag === 'all' || product.tags.includes(activeTag);
            return categoryMatch && tagMatch;
        });

        filteredProducts.forEach(product => {
            const productCard = `
                <div class="product-card" data-id="${product.id}" data-action="open-modal">
                    <div class="product-image-wrapper">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-meta">
                            <span class="product-price">$${product.price}</span>
                            <span class="product-status">In Stock</span>
                        </div>
                    </div>
                    <button class="wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
            `;
            productsGrid.insertAdjacentHTML('beforeend', productCard);
        });
    }

    function updateWishlistBadge() {
        wishlistBadge.textContent = wishlist.length;
        wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }

    function updateCartBadge() {
        cartBadge.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartBadge.style.display = cart.length > 0 ? 'flex' : 'none';
    }

    productsGrid.addEventListener('click', e => {
        const productCard = e.target.closest('.product-card');
        if (!productCard) return;

        const productId = parseInt(productCard.dataset.id);

        if (e.target.closest('.wishlist-btn')) {
            toggleWishlist(productId, e.target.closest('.wishlist-btn'));
        } else if (productCard.dataset.action === 'open-modal') {
            openProductModal(productId);
        }
    });

    function toggleWishlist(productId, btn) {
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
    }

    function openProductModal(productId) {
        const product = products.find(p => p.id === productId);
        const isCover = product.category === 'Phone Covers' || product.category === 'iPad Covers';
        
        const selectorHtml = isCover ? `
            <div class="device-selector">
                <label>Device Model</label>
                <div class="device-options">
                    ${product.category === 'Phone Covers' ? 
                        '<button class="device-btn active">iPhone 13</button><button class="device-btn">iPhone 14</button><button class="device-btn">iPhone 15</button>' : 
                        '<button class="device-btn active">iPad Pro 11</button><button class="device-btn">iPad Air</button><button class="device-btn">iPad Mini</button>'}
                </div>
            </div>
        ` : `
            <div class="size-selector">
                <label>Size</label>
                <div class="size-options">
                    <button class="size-btn active">S</button>
                    <button class="size-btn">M</button>
                    <button class="size-btn">L</button>
                    <button class="size-btn">XL</button>
                </div>
            </div>
        `;

        productModal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close close-btn" data-action="close-modal">&times;</button>
                <div class="modal-body">
                    <div class="modal-product">
                        <img src="${product.image}" alt="${product.name}" class="modal-image">
                        <div class="modal-details">
                            <h2>${product.name}</h2>
                            <p class="product-price">$${product.price}</p>
                            ${selectorHtml}
                            <div class="quantity-selector">
                                <label>Quantity</label>
                                <div class="quantity-controls">
                                    <button class="qty-btn" data-action="decrease-qty">-</button>
                                    <span class="qty-display">1</span>
                                    <button class="qty-btn" data-action="increase-qty">+</button>
                                </div>
                            </div>
                            <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        productModal.classList.add('open');
    }

    function closeProductModal() {
        productModal.classList.remove('open');
    }

    productModal.addEventListener('click', e => {
        if (e.target.dataset.action === 'close-modal') {
            closeProductModal();
        } else if (e.target.classList.contains('size-btn') || e.target.classList.contains('device-btn')) {
            document.querySelectorAll('.size-btn, .device-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        } else if (e.target.dataset.action === 'decrease-qty') {
            const qtyDisplay = document.querySelector('.qty-display');
            let qty = parseInt(qtyDisplay.textContent);
            if (qty > 1) {
                qtyDisplay.textContent = qty - 1;
            }
        } else if (e.target.dataset.action === 'increase-qty') {
            const qtyDisplay = document.querySelector('.qty-display');
            qtyDisplay.textContent = parseInt(qtyDisplay.textContent) + 1;
        } else if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = parseInt(e.target.dataset.id);
            const selector = document.querySelector('.size-btn.active') || document.querySelector('.device-btn.active');
            const selection = selector ? selector.textContent : 'N/A';
            const quantity = parseInt(document.querySelector('.qty-display').textContent);
            addToCart(productId, selection, quantity);
            closeProductModal();
        }
    });

    function addToCart(productId, selection, quantity) {
        const existingItem = cart.find(item => item.id === productId && item.selection === selection);
        const product = products.find(p => p.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id: productId, name: product.name, price: product.price, selection, quantity });
        }
        updateCartBadge();
        renderCart();
    }

    function renderCart() {
        cartSidebar.innerHTML = '';
        if (cart.length === 0) {
            cartSidebar.innerHTML = `
                <div class="sidebar-header">
                    <h3>Your Cart</h3>
                    <button class="close-btn" data-action="close-cart">&times;</button>
                </div>
                <div class="sidebar-empty">
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            const cartItemsHTML = cart.map(item => {
                const product = products.find(p => p.id === item.id);
                return `
                    <div class="cart-item" data-id="${item.id}" data-selection="${item.selection}">
                        <img src="${product.image}" alt="${product.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${product.name}</p>
                            <p class="cart-item-size">${item.selection}</p>
                            <p class="cart-item-price">$${product.price}</p>
                            <div class="cart-item-actions">
                                <button class="qty-btn" data-action="decrease-cart-qty">-</button>
                                <span class="qty-display">${item.quantity}</span>
                                <button class="qty-btn" data-action="increase-cart-qty">+</button>
                                <button class="remove-btn" data-action="remove-from-cart">Remove</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            const total = cart.reduce((acc, item) => {
                const product = products.find(p => p.id === item.id);
                return acc + (product.price * item.quantity);
            }, 0);

            cartSidebar.innerHTML = `
                <div class="sidebar-header">
                    <h3>Your Cart</h3>
                    <button class="close-btn" data-action="close-cart">&times;</button>
                </div>
                <div class="sidebar-items">${cartItemsHTML}</div>
                <div class="sidebar-footer">
                    <div class="cart-total">
                        <span>Total</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <button class="checkout-btn">Checkout</button>
                </div>
            `;

            const checkoutBtn = cartSidebar.querySelector('.checkout-btn');
            checkoutBtn.addEventListener('click', () => {
                localStorage.setItem('cart', JSON.stringify(cart));
                window.location.href = 'checkout.html';
            });
        }
    }

    function renderWishlist() {
        wishlistSidebar.innerHTML = '';
        if (wishlist.length === 0) {
            wishlistSidebar.innerHTML = `
                <div class="sidebar-header">
                    <h3>Your Wishlist</h3>
                    <button class="close-btn" data-action="close-wishlist">&times;</button>
                </div>
                <div class="sidebar-empty">
                    <p>Your wishlist is empty</p>
                </div>
                 <div class="sidebar-footer">
                    <button class="checkout-btn">Sign in to save</button>
                </div>
            `;
        } else {
            const wishlistItemsHTML = wishlist.map(productId => {
                const product = products.find(p => p.id === productId);
                return `
                    <div class="cart-item" data-id="${product.id}">
                        <img src="${product.image}" alt="${product.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${product.name}</p>
                            <p class="cart-item-price">$${product.price}</p>
                             <button class="remove-btn" data-action="remove-from-wishlist">Remove</button>
                        </div>
                    </div>
                `;
            }).join('');
             wishlistSidebar.innerHTML = `
                <div class="sidebar-header">
                    <h3>Your Wishlist</h3>
                    <button class="close-btn" data-action="close-wishlist">&times;</button>
                </div>
                <div class="sidebar-items">${wishlistItemsHTML}</div>
                <div class="sidebar-footer">
                    <button class="checkout-btn">Sign in to save</button>
                </div>
            `;
        }
    }

    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    });

    wishlistBtn.addEventListener('click', () => {
        wishlistSidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    });

    cartSidebar.addEventListener('click', e => {
        if (e.target.dataset.action === 'close-cart') {
            cartSidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        } else if (e.target.dataset.action === 'remove-from-cart') {
            const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.id);
            const selection = cartItem.dataset.selection;
            cart = cart.filter(item => !(item.id === productId && item.selection === selection));
            renderCart();
            updateCartBadge();
        } else if (e.target.dataset.action === 'decrease-cart-qty') {
             const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.id);
            const selection = cartItem.dataset.selection;
            const item = cart.find(item => item.id === productId && item.selection === selection);
            if (item.quantity > 1) {
                item.quantity--;
                renderCart();
                updateCartBadge();
            }
        } else if (e.target.dataset.action === 'increase-cart-qty') {
            const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.id);
            const selection = cartItem.dataset.selection;
            const item = cart.find(item => item.id === productId && item.selection === selection);
            item.quantity++;
            renderCart();
            updateCartBadge();
        }
    });

    wishlistSidebar.addEventListener('click', e => {
        if (e.target.dataset.action === 'close-wishlist') {
            wishlistSidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        } else if (e.target.dataset.action === 'remove-from-wishlist') {
            const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.id);
            toggleWishlist(productId, document.querySelector(`.product-card[data-id="${productId}"] .wishlist-btn`));
        }
    });

    sidebarOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        wishlistSidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            activeTag = tag.dataset.filter;
            renderProducts();
        });
    });

    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const isAlreadyActive = filter.classList.contains('active');
            
            categoryFilters.forEach(f => f.classList.remove('active'));

            if (isAlreadyActive) {
                activeCategory = 'all';
            } else {
                filter.classList.add('active');
                activeCategory = filter.dataset.category;
            }

            activeTag = 'all';
            filterTags.forEach(t => t.classList.remove('active'));
            const allTag = document.querySelector('.filter-tag[data-filter="all"]');
            if (allTag) {
                allTag.classList.add('active');
            }

            renderProducts();
        });
    });

    renderProducts();
    renderCart();
    renderWishlist();
});
