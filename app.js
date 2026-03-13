
const products = [
    {
        id: 1,
        name: 'Brainrot',
        price: 19.99,
        image: 'assets/brainrot.svg',
        category: 'crazy',
        tags: ['crazy', 'design'],
    },
    {
        id: 2,
        name: 'Couple Goals',
        price: 29.99,
        image: 'assets/couple goals.svg',
        category: 'couplegoals',
        tags: ['couplegoals'],
    },
    {
        id: 3,
        name: 'Intellactual',
        price: 24.99,
        image: 'assets/intellactual.svg',
        category: 'intellectual',
        tags: ['intellectual', 'design'],
    },
    {
        id: 4,
        name: 'Mug',
        price: 14.99,
        image: 'assets/mug.svg',
        category: 'nerdy',
        tags: ['nerdy', 'design'],
    },
    {
        id: 5,
        name: 'Nerdy',
        price: 22.99,
        image: 'assets/nerdy.svg',
        category: 'nerdy',
        tags: ['nerdy', 'design'],
    },
    {
        id: 6,
        name: 'Robo',
        price: 27.99,
        image: 'assets/robo.svg',
        category: 'nerdy',
        tags: ['nerdy', 'design'],
    },
    {
        id: 7,
        name: 'T Sherting',
        price: 19.99,
        image: 'assets/t sherting.svg',
        category: 'intellectual',
        tags: ['intellectual', 'design'],
    },
];

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productsGrid');
    const filterTags = document.querySelectorAll('.filter-tag');
    const wishlistBadge = document.getElementById('wishlistBadge');
    const cartBadge = document.getElementById('cartBadge');
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const productModal = document.getElementById('productModal');

    let wishlist = [];
    let cart = [];

    function renderProducts(filter = 'all') {
        productsGrid.innerHTML = '';
        const filteredProducts = products.filter(product => {
            if (filter === 'all') return true;
            return product.tags.includes(filter);
        });

        filteredProducts.forEach(product => {
            const productCard = `
                <div class="product-card" data-id="${product.id}">
                    <div class="product-image-wrapper">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <div class="product-overlay">
                            <button class="overlay-icon" data-action="open-modal">View</button>
                        </div>
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
        }

        if (e.target.dataset.action === 'open-modal') {
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
    }

    function openProductModal(productId) {
        const product = products.find(p => p.id === productId);
        productModal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close close-btn" data-action="close-modal">&times;</button>
                <div class="modal-body">
                    <div class="modal-product">
                        <img src="${product.image}" alt="${product.name}" class="modal-image">
                        <div class="modal-details">
                            <h2>${product.name}</h2>
                            <p class="product-price">$${product.price}</p>
                            <div class="size-selector">
                                <label>Size</label>
                                <div class="size-options">
                                    <button class="size-btn active">S</button>
                                    <button class="size-btn">M</button>
                                    <button class="size-btn">L</button>
                                    <button class="size-btn">XL</button>
                                </div>
                            </div>
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
        } else if (e.target.classList.contains('size-btn')) {
            document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
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
            const size = document.querySelector('.size-btn.active').textContent;
            const quantity = parseInt(document.querySelector('.qty-display').textContent);
            addToCart(productId, size, quantity);
            closeProductModal();
        }
    });

    function addToCart(productId, size, quantity) {
        const existingItem = cart.find(item => item.id === productId && item.size === size);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id: productId, size, quantity });
        }
        updateCartBadge();
        renderCart();
    }
    
    function renderCart() {
        cartSidebar.innerHTML = '';
        if (cart.length === 0) {
            cartSidebar.innerHTML = `
                <div class="cart-header">
                    <h3>Your Cart</h3>
                    <button class="close-btn" data-action="close-cart">&times;</button>
                </div>
                <div class="cart-empty">
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            const cartItemsHTML = cart.map(item => {
                const product = products.find(p => p.id === item.id);
                return `
                    <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
                        <img src="${product.image}" alt="${product.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${product.name}</p>
                            <p class="cart-item-size">Size: ${item.size}</p>
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
                <div class="cart-header">
                    <h3>Your Cart</h3>
                    <button class="close-btn" data-action="close-cart">&times;</button>
                </div>
                <div class="cart-items">${cartItemsHTML}</div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <button class="checkout-btn">Checkout</button>
                </div>
            `;
        }
    }
    
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
    });
    
    cartSidebar.addEventListener('click', e => {
        if (e.target.dataset.action === 'close-cart') {
            cartSidebar.classList.remove('open');
            cartOverlay.classList.remove('active');
        } else if (e.target.dataset.action === 'remove-from-cart') {
            const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.id);
            const size = cartItem.dataset.size;
            cart = cart.filter(item => !(item.id === productId && item.size === size));
            renderCart();
            updateCartBadge();
        } else if (e.target.dataset.action === 'decrease-cart-qty') {
             const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.id);
            const size = cartItem.dataset.size;
            const item = cart.find(item => item.id === productId && item.size === size);
            if (item.quantity > 1) {
                item.quantity--;
                renderCart();
                updateCartBadge();
            }
        } else if (e.target.dataset.action === 'increase-cart-qty') {
            const cartItem = e.target.closest('.cart-item');
            const productId = parseInt(cartItem.dataset.id);
            const size = cartItem.dataset.size;
            const item = cart.find(item => item.id === productId && item.size === size);
            item.quantity++;
            renderCart();
            updateCartBadge();
        }
    });

    cartOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('active');
    });

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            const filter = tag.dataset.filter;
            renderProducts(filter);
        });
    });

    renderProducts();
    renderCart();
});
