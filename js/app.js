const products = [
  {
    id: 1,
    name: "Brainrot",
    price: 19.99,
    image: "assets/brainrot.svg",
    category: "T-Shirts",
    tags: ["crazy", "design"],
  },
  {
    id: 2,
    name: "Couple Goals",
    price: 29.99,
    image: "assets/couple goals.svg",
    category: "T-Shirts",
    tags: ["couplegoals"],
  },
  {
    id: 3,
    name: "Intellactual",
    price: 24.99,
    image: "assets/intellactual.svg",
    category: "T-Shirts",
    tags: ["intellectual", "design"],
  },
  {
    id: 4,
    name: "Mug",
    price: 14.99,
    image: "assets/mug.svg",
    category: "Mugs",
    tags: ["nerdy", "design"],
  },
  {
    id: 5,
    name: "Nerdy",
    price: 22.99,
    image: "assets/nerdy.svg",
    category: "T-Shirts",
    tags: ["nerdy", "design"],
  },
  {
    id: 6,
    name: "Robo",
    price: 27.99,
    image: "assets/robo.svg",
    category: "T-Shirts",
    tags: ["nerdy", "design"],
  },
  {
    id: 7,
    name: "T Sherting",
    price: 19.99,
    image: "assets/t sherting.svg",
    category: "T-Shirts",
    tags: ["intellectual", "design"],
  },
  {
    id: 8,
    name: "Cute Cover",
    price: 39.99,
    image: "assets/covers/cute.svg",
    category: "Phone Covers",
    tags: ["cute", "design"],
  },
  {
    id: 9,
    name: "Pair A Cover",
    price: 45.99,
    image: "assets/covers/pair A.svg",
    category: "Phone Covers",
    tags: ["couplegoals", "design"],
  },
  {
    id: 10,
    name: "Totem Cover",
    price: 42.99,
    image: "assets/covers/totem.svg",
    category: "Phone Covers",
    tags: ["spiritual", "design"],
  },
  {
    id: 11,
    name: "Cute iPad Cover",
    price: 59.99,
    image: "assets/covers/cute.svg",
    category: "iPad Covers",
    tags: ["cute", "design"],
  },
  {
    id: 12,
    name: "Pair A iPad Cover",
    price: 65.99,
    image: "assets/covers/pair A.svg",
    category: "iPad Covers",
    tags: ["couplegoals", "design"],
  },
  {
    id: 13,
    name: "Totem iPad Cover",
    price: 62.99,
    image: "assets/covers/totem.svg",
    category: "iPad Covers",
    tags: ["spiritual", "design"],
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const productsGrid = document.getElementById("productsGrid");
  const filterTags = document.querySelectorAll(".filter-tag");
  const categoryFilters = document.querySelectorAll(".category-filter");
  const wishlistBadge = document.getElementById("wishlistBadge");
  const cartBadge = document.getElementById("cartBadge");
  const cartBtn = document.getElementById("cartBtn");
  const wishlistBtn = document.getElementById("wishlistBtn");
  const cartSidebar = document.getElementById("cartSidebar");
  const wishlistSidebar = document.getElementById("wishlistSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const productModal = document.getElementById("productModal");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let activeCategory = "all";
  let activeTag = "all";
  let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  let hasSeenLoginPrompt =
    localStorage.getItem("hasSeenLoginPrompt") === "true";

  // TODO: [Backend Integration] Integrate OAuth 2.0 to handle authentication securely and store session tokens
  // instead of local dummy variables. User data (cart/wishlist) should be fetched from the SQLite database
  // upon successful login via the Python backend.

  function showLoginPrompt(onLogin, onNvm) {
    if (isLoggedIn || hasSeenLoginPrompt) {
      onNvm();
      return;
    }

    if (document.getElementById("loginPromptModal")) {
      // Modal already exists, just attach to it or wait.
      // Since we're executing back to back, the easiest is to set a global pending action queue.
      window.pendingLoginActions = window.pendingLoginActions || [];
      window.pendingLoginActions.push(onNvm); // For NVM
      window.pendingLoginActionsLogin = window.pendingLoginActionsLogin || [];
      window.pendingLoginActionsLogin.push(onLogin);
      return;
    }

    window.pendingLoginActions = [onNvm];
    window.pendingLoginActionsLogin = [onLogin];

    const modalHtml = `
            <div class="modal open" id="loginPromptModal" style="z-index: 5000;">
                <div class="modal-content" style="max-width: 400px; text-align: center; padding: 2rem;">
                    <h2 style="margin-bottom: 1rem;">Save Your Progress</h2>
                    <p style="margin-bottom: 2rem; color: #b4b4b4;">You must login to save your wishlist and cart securely.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="nvmBtn" style="background: #1a1a1a; color: #eeeeee; border: 1px solid #2a2a2a; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Nvm</button>
                        <button id="loginBtn" style="background: #3b82f6; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Login</button>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
    const modal = document.getElementById("loginPromptModal");

    document.getElementById("nvmBtn").addEventListener("click", () => {
      modal.remove();
      hasSeenLoginPrompt = true;
      localStorage.setItem("hasSeenLoginPrompt", "true");
      window.pendingLoginActions.forEach((action) => action());
      window.pendingLoginActions = [];
      window.pendingLoginActionsLogin = [];
    });

    document.getElementById("loginBtn").addEventListener("click", () => {
      modal.remove();
      isLoggedIn = true;
      hasSeenLoginPrompt = true;
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("hasSeenLoginPrompt", "true");
      window.pendingLoginActionsLogin.forEach((action) => action());
      window.pendingLoginActions = [];
      window.pendingLoginActionsLogin = [];
    });
  }

  function saveState() {
    // TODO: [Backend Integration] Sync cart and wishlist with Python backend / SQLite DB here.
    if (localStorage.getItem("isLoggedIn") === "true") {
      fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cart, wishlist })
      }).catch(err => console.error("Error syncing state:", err));
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }

  function renderProducts() {
    productsGrid.innerHTML = "";
    const filteredProducts = products.filter((product) => {
      const categoryMatch =
        activeCategory === "all" || product.category === activeCategory;
      const tagMatch = activeTag === "all" || product.tags.includes(activeTag);
      return categoryMatch && tagMatch;
    });

    filteredProducts.forEach((product) => {
      const productCard = `
                <div class="product-card" data-id="${product.id}" data-action="open-modal">
                    <div class="product-image-wrapper">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-meta">
                            <span class="product-price">₹${product.price}</span>
                            <span class="product-status">In Stock</span>
                        </div>
                    </div>
                    <button class="wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}" aria-label="Add to Wishlist">
                        <svg width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
            `;
      productsGrid.insertAdjacentHTML("beforeend", productCard);
    });
  }

  function updateWishlistBadge() {
    wishlistBadge.textContent = wishlist.length;
    wishlistBadge.style.display = wishlist.length > 0 ? "flex" : "none";
  }

  function updateCartBadge() {
    cartBadge.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartBadge.style.display = cart.length > 0 ? "flex" : "none";
  }

  productsGrid.addEventListener("click", (e) => {
    const productCard = e.target.closest(".product-card");
    if (!productCard) return;

    const productId = parseInt(productCard.dataset.id);

    if (e.target.closest(".wishlist-btn")) {
      toggleWishlist(productId, e.target.closest(".wishlist-btn"));
    } else if (productCard.dataset.action === "open-modal") {
      openProductModal(productId);
    }
  });

  function toggleWishlist(productId, btn) {
    const index = wishlist.indexOf(productId);

    const action = () => {
      if (index > -1) {
        wishlist.splice(index, 1);
        btn.classList.remove("active");
      } else {
        wishlist.push(productId);
        btn.classList.add("active");
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
  }

  function openProductModal(productId) {
    const product = productMap.get(productId);
    const isCover =
      product.category === "Phone Covers" || product.category === "iPad Covers";
    const isMug = product.category === "Mugs";

    let selectorHtml = "";
    if (isCover) {
      selectorHtml = `
                <div class="device-selector">
                    <label for="device-select">Device Model</label>
                    <div class="device-options">
                        <input list="device-models" id="device-select" name="device-select" class="dropdown-select" placeholder="Type or select model..." />
                        <datalist id="device-models">
                            ${
                              product.category === "Phone Covers"
                                ? `<option value="iPhone 13">
                                <option value="iPhone 13 Pro">
                                <option value="iPhone 13 Pro Max">
                                <option value="iPhone 14">
                                <option value="iPhone 14 Pro">
                                <option value="iPhone 14 Pro Max">
                                <option value="iPhone 15">
                                <option value="iPhone 15 Pro">
                                <option value="iPhone 15 Pro Max">
                                <option value="iPhone 16">
                                <option value="iPhone 16 Pro">
                                <option value="iPhone 16 Pro Max">
                                <option value="Samsung Galaxy S23">
                                <option value="Samsung Galaxy S23+">
                                <option value="Samsung Galaxy S23 Ultra">
                                <option value="Samsung Galaxy S24">
                                <option value="Samsung Galaxy S24+">
                                <option value="Samsung Galaxy S24 Ultra">
                                <option value="Google Pixel 8">
                                <option value="Google Pixel 8 Pro">
                                <option value="Google Pixel 9">
                                <option value="Google Pixel 9 Pro">`
                                : `<option value="iPad Pro 11">
                                <option value="iPad Pro 12.9">
                                <option value="iPad Air">
                                <option value="iPad Mini">
                                <option value="iPad 10th Gen">
                                <option value="iPad 9th Gen">`
                            }
                        </datalist>
                    </div>
                </div>
            `;
    } else if (!isMug) {
      selectorHtml = `
                <div class="size-selector">
                    <label for="size-select">Size</label>
                    <div class="size-options">
                        <select id="size-select" class="dropdown-select">
                            <option value="S">S</option>
                            <option value="M" selected>M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                        </select>
                    </div>
                </div>
            `;
    }

    productModal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close close-btn" data-action="close-modal" aria-label="Close modal">&times;</button>
                <div class="modal-body">
                    <div class="modal-product">
                        <img src="${product.image}" alt="${product.name}" class="modal-image">
                        <div class="modal-details">
                            <h2>${product.name}</h2>
                            <p class="product-price">₹${product.price}</p>
                            ${selectorHtml}
                            <div class="quantity-selector">
                                <label>Quantity</label>
                                <div class="quantity-controls">
                                    <button class="qty-btn" data-action="decrease-qty" aria-label="Decrease quantity">-</button>
                                    <span class="qty-display">1</span>
                                    <button class="qty-btn" data-action="increase-qty" aria-label="Increase quantity">+</button>
                                </div>
                            </div>
                            <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    productModal.classList.add("open");
  }

  function closeProductModal() {
    productModal.classList.remove("open");
  }

  productModal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-image")) {
      e.target.classList.toggle("full-view");
    } else if (e.target.dataset.action === "close-modal") {
      const modalImage = document.querySelector(".modal-image");
      if (modalImage && modalImage.classList.contains("full-view")) {
        modalImage.classList.remove("full-view");
      }
      closeProductModal();
    } else if (e.target.dataset.action === "decrease-qty") {
      const qtyDisplay = document.querySelector(".qty-display");
      let qty = parseInt(qtyDisplay.textContent);
      if (qty > 1) {
        qtyDisplay.textContent = qty - 1;
      }
    } else if (e.target.dataset.action === "increase-qty") {
      const qtyDisplay = document.querySelector(".qty-display");
      qtyDisplay.textContent = parseInt(qtyDisplay.textContent) + 1;
    } else if (e.target.classList.contains("add-to-cart-btn")) {
      const productId = parseInt(e.target.dataset.id);
      const sizeSelect = document.getElementById("size-select");
      const deviceSelect = document.getElementById("device-select");
      let selection = "N/A";

      if (sizeSelect) {
        selection = sizeSelect.value;
      } else if (deviceSelect) {
        selection = deviceSelect.value || "N/A";
      }

      const quantity = parseInt(
        document.querySelector(".qty-display").textContent,
      );
      addToCart(productId, selection, quantity);
      closeProductModal();
    }
  });

  function addToCart(productId, selection, quantity) {
    const existingItem = cart.find(
      (item) => item.id === productId && item.selection === selection,
    );
    const product = productMap.get(productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      action();
    }
  }

  function renderCart() {
    cartSidebar.innerHTML = "";
    if (cart.length === 0) {
      cartSidebar.innerHTML = `
                <div class="sidebar-header">
                    <h3>Your Cart</h3>
                    <button class="close-btn" data-action="close-cart" aria-label="Close cart">&times;</button>
                </div>
                <div class="sidebar-empty">
                    <p>Your cart is empty</p>
                </div>
            `;
    } else {
      const cartItemsHTML = cart
        .map((item) => {
          const product = productMap.get(item.id);
          const safeName = escapeHTML(product.name);
          const safeSelection = escapeHTML(item.selection);
          return `
                    <div class="cart-item" data-id="${item.id}" data-selection="${safeSelection}">
                        <img src="${product.image}" alt="${safeName}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${safeName}</p>
                            <p class="cart-item-size">${safeSelection}</p>
                            <p class="cart-item-price">₹${product.price}</p>
                            <div class="cart-item-actions">
                                <button class="qty-btn" data-action="decrease-cart-qty" aria-label="Decrease cart quantity">-</button>
                                <span class="qty-display">${item.quantity}</span>
                                <button class="qty-btn" data-action="increase-cart-qty" aria-label="Increase cart quantity">+</button>
                                <button class="remove-btn" data-action="remove-from-cart" aria-label="Remove item">Remove</button>
                            </div>
                        </div>
                    </div>
                `;
        })
        .join("");

      const total = cart.reduce((acc, item) => {
        const product = productMap.get(item.id);
        return acc + product.price * item.quantity;
      }, 0);

      cartSidebar.innerHTML = `
                <div class="sidebar-header">
                    <h3>Your Cart</h3>
                    <button class="close-btn" data-action="close-cart" aria-label="Close cart">&times;</button>
                </div>
                <div class="sidebar-items">${cartItemsHTML}</div>
                <div class="sidebar-footer">
                    <div class="cart-total">
                        <span>Total</span>
                        <span>₹${total.toFixed(2)}</span>
                    </div>
                    <button class="checkout-btn" data-action="checkout">Checkout</button>
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
    wishlistSidebar.innerHTML = "";
    if (wishlist.length === 0) {
      wishlistSidebar.innerHTML = `
                <div class="sidebar-header">
                    <h3>Your Wishlist</h3>
                    <button class="close-btn" data-action="close-wishlist" aria-label="Close wishlist">&times;</button>
                </div>
                <div class="sidebar-empty">
                    <p>Your wishlist is empty</p>
                </div>
                 <div class="sidebar-footer">
                    <button class="checkout-btn">Sign in to save</button>
                </div>
            `;
    } else {
      const wishlistItemsHTML = wishlist
        .map((productId) => {
          const product = productMap.get(productId);
          const safeName = escapeHTML(product.name);
          return `
                    <div class="cart-item" data-id="${product.id}">
                        <img src="${product.image}" alt="${safeName}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${safeName}</p>
                            <p class="cart-item-price">₹${product.price}</p>
                             <button class="remove-btn" data-action="remove-from-wishlist" aria-label="Remove from wishlist">Remove</button>
                        </div>
                    </div>
                `;
        })
        .join("");
      wishlistSidebar.innerHTML = `
                <div class="sidebar-header">
                    <h3>Your Wishlist</h3>
                    <button class="close-btn" data-action="close-wishlist" aria-label="Close wishlist">&times;</button>
                </div>
                <div class="sidebar-items">${wishlistItemsHTML}</div>
                <div class="sidebar-footer">
                    <button class="checkout-btn">Sign in to save</button>
                </div>
            `;
    }
  }

  cartBtn.addEventListener("click", () => {
    cartSidebar.classList.add("open");
    sidebarOverlay.classList.add("active");
  });

  wishlistBtn.addEventListener("click", () => {
    wishlistSidebar.classList.add("open");
    sidebarOverlay.classList.add("active");
  });

  cartSidebar.addEventListener("click", (e) => {
    if (e.target.dataset.action === "close-cart") {
      cartSidebar.classList.remove("open");
      sidebarOverlay.classList.remove("active");
    } else if (e.target.dataset.action === "remove-from-cart") {
      const cartItem = e.target.closest(".cart-item");
      const productId = parseInt(cartItem.dataset.id);
      const selection = cartItem.dataset.selection;
      cart = cart.filter(
        (item) => !(item.id === productId && item.selection === selection),
      );
      saveState();
      renderCart();
      updateCartBadge();
    } else if (e.target.dataset.action === "decrease-cart-qty") {
      const cartItem = e.target.closest(".cart-item");
      const productId = parseInt(cartItem.dataset.id);
      const selection = cartItem.dataset.selection;
      const item = cart.find(
        (item) => item.id === productId && item.selection === selection,
      );
      if (item.quantity > 1) {
        item.quantity--;
        saveState();
        renderCart();
        updateCartBadge();
      }
    } else if (e.target.dataset.action === "increase-cart-qty") {
      const cartItem = e.target.closest(".cart-item");
      const productId = parseInt(cartItem.dataset.id);
      const selection = cartItem.dataset.selection;
      const item = cart.find(
        (item) => item.id === productId && item.selection === selection,
      );
      item.quantity++;
      saveState();
      renderCart();
      updateCartBadge();
    } else if (e.target.dataset.action === "checkout") {
      window.location.href = "checkout.html";
    }
  });

  wishlistSidebar.addEventListener("click", (e) => {
    if (e.target.dataset.action === "close-wishlist") {
      wishlistSidebar.classList.remove("open");
      sidebarOverlay.classList.remove("active");
    } else if (e.target.dataset.action === "remove-from-wishlist") {
      const cartItem = e.target.closest(".cart-item");
      const productId = parseInt(cartItem.dataset.id);
      toggleWishlist(
        productId,
        document.querySelector(
          `.product-card[data-id="${productId}"] .wishlist-btn`,
        ),
      );
    }
  });

  sidebarOverlay.addEventListener("click", () => {
    cartSidebar.classList.remove("open");
    wishlistSidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
  });

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });

    // Close mobile menu when a nav link is clicked
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
      });
    });
  }

  filterTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      filterTags.forEach((t) => t.classList.remove("active"));
      tag.classList.add("active");
      activeTag = tag.dataset.filter;
      renderProducts();
    });
  });

  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      categoryFilters.forEach((f) => f.classList.remove("active"));
      filter.classList.add("active");
      activeCategory = filter.dataset.category;
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

  function renderCouples() {
    const couplesGrid = document.getElementById("couplesGrid");
    if (!couplesGrid) return;

    couplesGrid.innerHTML = "";

        // Find all products with the 'couplegoals' tag
        const coupleProducts = products.filter(p => p.tags.includes('couplegoals'));

    // Ensure we have an even number for pairing
    const pairs = [];
    for (let i = 0; i < coupleProducts.length; i += 2) {
      if (i + 1 < coupleProducts.length) {
        pairs.push([coupleProducts[i], coupleProducts[i + 1]]);
      }
    }

    // If we have an odd number, pair the last one with the first one
    if (coupleProducts.length % 2 !== 0 && coupleProducts.length > 1) {
      pairs.push([
        coupleProducts[coupleProducts.length - 1],
        coupleProducts[0],
      ]);
    }

    pairs.forEach((pair) => {
      const [item1, item2] = pair;
      const bundlePrice = (item1.price + item2.price) * 0.9; // 10% off for bundle

      const coupleCard = `
                <div class="couple-card">
                    <div class="couple-products">
                        <img src="${item1.image}" alt="${item1.name}" class="couple-product-img">
                        <img src="${item2.image}" alt="${item2.name}" class="couple-product-img">
                    </div>
                    <div>
                        <h3 style="margin-bottom: 0.5rem">${item1.name} + ${item2.name}</h3>
                        <p style="color: #b4b4b4; margin-bottom: 1rem">Perfect match combo. Save 10% when you buy together!</p>
                        <div style="display: flex; justify-content: space-between; align-items: center">
                            <div>
                                <span style="text-decoration: line-through; color: #a3a3a3; font-size: 0.9rem">₹${(item1.price + item2.price).toFixed(2)}</span>
                                <span style="color: #3b82f6; font-weight: 700; font-size: 1.2rem; margin-left: 0.5rem">₹${bundlePrice.toFixed(2)}</span>
                            </div>
                            <button class="bundle-btn" data-id1="${item1.id}" data-id2="${item2.id}">Add Bundle</button>
                        </div>
                    </div>
                </div>
            `;
      couplesGrid.insertAdjacentHTML("beforeend", coupleCard);
    });

    couplesGrid.addEventListener("click", (e) => {
      if (e.target.classList.contains("bundle-btn")) {
        const id1 = parseInt(e.target.dataset.id1);
        const id2 = parseInt(e.target.dataset.id2);

        // Add both to cart with default sizes if applicable
        const product1 = productMap.get(id1);
        const product2 = productMap.get(id2);

        const getSelection = (product) => {
          if (product.category === "Phone Covers") return "iPhone 15";
          if (product.category === "iPad Covers") return "iPad Pro 11";
          if (product.category !== "Mugs") return "M";
          return "N/A";
        };

        addToCart(id1, getSelection(product1), 1);
        addToCart(id2, getSelection(product2), 1);

        cartSidebar.classList.add("open");
        sidebarOverlay.classList.add("active");
      }
    });
  }

  renderProducts();
  renderCart();
  renderWishlist();
  renderCouples();
  updateCartBadge();
  updateWishlistBadge();
  updateCartBadge();
  updateWishlistBadge();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escapeHTML };
}
