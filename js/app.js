const products = [
  {
    id: 1,
    name: "Brainrot",
    price: 199,
    image: "assets/brainrot.webp",
    category: "T-Shirts",
    tags: ["crazy", "design"],
  },
  {
    id: 2,
    name: "Couple Goals",
    price: 299,
    image: "assets/couple goals.webp",
    category: "T-Shirts",
    tags: ["couplegoals"],
  },
  {
    id: 3,
    name: "Intellactual",
    price: 249,
    image: "assets/intellactual.webp",
    category: "T-Shirts",
    tags: ["intellectual", "design"],
  },
  {
    id: 4,
    name: "Mug",
    price: 149,
    image: "assets/mug.webp",
    category: "Mugs",
    tags: ["nerdy", "design"],
  },
  {
    id: 5,
    name: "Nerdy",
    price: 229,
    image: "assets/nerdy.webp",
    category: "T-Shirts",
    tags: ["nerdy", "design"],
  },
  {
    id: 6,
    name: "Robo",
    price: 279,
    image: "assets/robo.webp",
    category: "T-Shirts",
    tags: ["nerdy", "design"],
  },
  {
    id: 7,
    name: "T Sherting",
    price: 199,
    image: "assets/t sherting.webp",
    category: "T-Shirts",
    tags: ["intellectual", "design"],
  },
  {
    id: 8,
    name: "Cute Cover",
    price: 399,
    image: "assets/covers/cute.webp",
    category: "Phone Covers",
    tags: ["cute", "design"],
  },
  {
    id: 9,
    name: "Pair A Cover",
    price: 459,
    image: "assets/covers/pair A.webp",
    category: "Phone Covers",
    tags: ["couplegoals", "design"],
  },
  {
    id: 10,
    name: "Totem Cover",
    price: 429,
    image: "assets/covers/totem.webp",
    category: "Phone Covers",
    tags: ["spiritual", "design"],
  },
  {
    id: 11,
    name: "Cute iPad Cover",
    price: 599,
    image: "assets/covers/cute.webp",
    category: "iPad Covers",
    tags: ["cute", "design"],
  },
  {
    id: 12,
    name: "Pair A iPad Cover",
    price: 659,
    image: "assets/covers/pair A.webp",
    category: "iPad Covers",
    tags: ["couplegoals", "design"],
  },
  {
    id: 13,
    name: "Totem iPad Cover",
    price: 629,
    image: "assets/covers/totem.webp",
    category: "iPad Covers",
    tags: ["spiritual", "design"],
  },
];

const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

const productsByTag = {};
for (const p of products) {
  if (p.tags) {
    for (const tag of p.tags) {
      if (!productsByTag[tag]) productsByTag[tag] = [];
      productsByTag[tag].push(p);
    }
  }
}

function setCookie(name, value, days = 7) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie =
    name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
  const cname = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(cname) == 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return "";
}

const BackendAPI = {
  async getUserData() {
    let wishlist = [];
    let cart = [];
    let isLoggedIn = getCookie("isLoggedIn") === "true";
    let hasSeenLoginPrompt = getCookie("hasSeenLoginPrompt") === "true";

    try {
      const storedWishlist = localStorage.getItem('wishlist') || getCookie("wishlist");
      if (storedWishlist) wishlist = JSON.parse(storedWishlist);

      const storedCart = localStorage.getItem('cart') || getCookie("cart");
      if (storedCart) cart = JSON.parse(storedCart);
    } catch (e) {
      console.error("Error parsing stored data", e);
    }

    return { wishlist, cart, isLoggedIn, hasSeenLoginPrompt };
  },

  async login() {
    // TODO: [Backend Integration] Integrate OAuth 2.0 to handle authentication securely and store session tokens
    // instead of local dummy variables. User data (cart/wishlist) should be fetched from the SQLite database
    // upon successful login via the Python backend.
    setCookie("isLoggedIn", "true");
    setCookie("hasSeenLoginPrompt", "true");
    return true;
  },

  async syncData(cart, wishlist, isLoggedIn) {
    // TODO: [Backend Integration] Sync cart and wishlist with Python backend / SQLite DB here.
    // Cookies are being used for placeholder frontend persistence. In production, use HttpOnly cookies for Auth.
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    setCookie("cart", JSON.stringify(cart));
    setCookie("wishlist", JSON.stringify(wishlist));

    if (isLoggedIn) {
      // TODO: [Backend Developer] Implement the /api/sync endpoint in the Python backend to receive and save this data to SQLite.
      try {
        await fetch("/api/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cart, wishlist }),
        });
      } catch (error) {
        console.error("Error syncing state with backend:", error);
      }
    }
  }
};

document.addEventListener("DOMContentLoaded", async () => {
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

  const userData = await BackendAPI.getUserData();
  let wishlist = userData.wishlist;
  let cart = userData.cart;
  let isLoggedIn = userData.isLoggedIn;
  let hasSeenLoginPrompt = userData.hasSeenLoginPrompt;
  let activeCategory = "all";
  let activeTag = "all";
  const gallerySearchInput = document.getElementById("gallerySearchInput");
  const searchClearBtn = document.getElementById("searchClearBtn");
  const carouselContainer = document.getElementById("featuredCarouselContainer");
  const categoriesSection = document.getElementById("categoriesSection");
  let searchQuery = "";

  function getSidebarHeaderHTML(title, action) {
    return `
                <div class="sidebar-header">
                    <h3>${title}</h3>
                    <button class="close-btn" data-action="${action}">&times;</button>
                </div>`;
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>"']/g, function (match) {
      const escapeMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return escapeMap[match];
    });
  }

  function highlightText(text, query) {
    const escapedText = escapeHTML(text);
    if (!query) return escapedText;
    const escapedQuery = escapeHTML(query);
    const regexQuery = escapedQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${regexQuery})`, 'gi');
    return escapedText.replace(regex, '<mark>$1</mark>');
  }

  // --- Login Action Queue ---
  let loginActionQueue = [];

  function enqueueLoginAction(onLogin, onNvm) {
    loginActionQueue.push({ onLogin, onNvm });
  }

  function processLoginQueue(loggedIn) {
    const queue = loginActionQueue.slice();
    loginActionQueue = [];
    queue.forEach(({ onLogin, onNvm }) => {
      if (loggedIn && onLogin) onLogin();
      else if (!loggedIn && onNvm) onNvm();
    });
  }

  function createLoginPromptModal() {
    const modal = document.createElement("div");
    modal.id = "loginPromptModal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:6000;display:flex;align-items:center;justify-content:center;";
    modal.innerHTML = `
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:16px;padding:2rem;max-width:380px;width:90%;text-align:center;">
        <h3 style="color:#fff;margin-bottom:1rem;">Welcome!</h3>
        <p style="color:#aaa;margin-bottom:1.5rem;">Sign in to save your cart and wishlist across sessions.</p>
        <div style="display:flex;gap:1rem;justify-content:center;">
          <button id="loginPromptSignIn" style="background:#3b82f6;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;cursor:pointer;font-weight:600;">Sign In</button>
          <button id="loginPromptNvm" style="background:#2a2a2a;color:#ccc;border:1px solid #333;padding:0.7rem 1.5rem;border-radius:8px;cursor:pointer;font-weight:600;">Not Now</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("loginPromptSignIn").addEventListener("click", async () => {
      await BackendAPI.login();
      isLoggedIn = true;
      hasSeenLoginPrompt = true;
      modal.remove();
      processLoginQueue(true);
    });

    document.getElementById("loginPromptNvm").addEventListener("click", () => {
      hasSeenLoginPrompt = true;
      setCookie("hasSeenLoginPrompt", "true");
      modal.remove();
      processLoginQueue(false);
    });
  }

  function showLoginPrompt(onLogin, onNvm) {
    if (isLoggedIn || hasSeenLoginPrompt) {
      if (onNvm) onNvm();
      return;
    }

    if (document.getElementById("loginPromptModal")) {
      enqueueLoginAction(onLogin, onNvm);
      return;
    }

    enqueueLoginAction(onLogin, onNvm);
    createLoginPromptModal();
  }

  function getSelection(product) {
    if (!product) return "N/A";
    const isCover = product.category === "Phone Covers" || product.category === "iPad Covers";
    const isMug = product.category === "Mugs";
    if (isCover) return "iPhone 15";
    if (isMug) return "N/A";
    return "M";
  }

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "success-message";
    const safeMessage = escapeHTML(message);
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>${safeMessage}</span>
      </div>
    `;
    notification.querySelector("span").textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 3000);
  }

  function saveState() {
    BackendAPI.syncData(cart, wishlist, isLoggedIn);
  }

  function renderProducts() {
    const query = searchQuery.trim().toLowerCase();
    
    // Hide carousel and category sections during active search queries
    const hasQuery = query.length > 0;
    if (carouselContainer) {
      carouselContainer.style.display = hasQuery ? "none" : "";
    }
    if (categoriesSection) {
      categoriesSection.style.display = hasQuery ? "none" : "";
    }

    const filteredProducts = products.filter((product) => {
      const categoryMatch =
        activeCategory === "all" || product.category === activeCategory;
      const tagMatch = activeTag === "all" || product.tags.includes(activeTag);
      const searchMatch = !query || 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query);
      return categoryMatch && tagMatch && searchMatch;
    });

    const wishlistSet = new Set(wishlist);

    if (productsGrid) {
      productsGrid.innerHTML = filteredProducts
        .map((product) => {
          const highlightedName = highlightText(product.name, query);
          return `
                  <div class="product-card" data-id="${product.id}" data-action="open-modal">
                      <button class="wishlist-btn ${
                        wishlistSet.has(product.id) ? "active" : ""
                      }">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                      </button>
                      <div class="product-image-wrapper">
                          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" class="product-image">
                      </div>
                      <div class="product-info">
                          <div>
                              <h3 class="product-name">${highlightedName}</h3>
                          </div>
                          <div class="product-meta">
                              <span class="product-price">₹${product.price}</span>
                              <span class="product-status">In Stock</span>
                          </div>
                      </div>
                  </div>
              `;
        })
        .join("");
    }
  }

  function updateWishlistBadge() {
    wishlistBadge.textContent = wishlist.length;
    wishlistBadge.style.display = wishlist.length > 0 ? "flex" : "none";
  }

  function updateCartBadge() {
    cartBadge.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartBadge.style.display = cart.length > 0 ? "flex" : "none";
  }

  if (productsGrid) {
    productsGrid.addEventListener("click", (e) => {
      const productCard = e.target.closest(".product-card");
      if (!productCard) return;

      const productId = parseInt(productCard.dataset.id);

      if (e.target.closest(".wishlist-btn")) {
        toggleWishlist(productId, e.target.closest(".wishlist-btn"));
      } else {
        window.location.href = `product.html?id=${productId}`;
      }
    });
  }

  function executeWithLoginPrompt(action) {
    if (cart.length === 0 && wishlist.length === 0) {
      showLoginPrompt(action, action);
    } else {
      action();
    }
  }

  function toggleWishlist(productId, btn) {
    const index = wishlist.indexOf(productId);

    const action = () => {
      if (index > -1) {
        wishlist.splice(index, 1);
        if (btn) btn.classList.remove("active");
      } else {
        wishlist.push(productId);
        if (btn) btn.classList.add("active");
      }
      saveState();
      updateWishlistBadge();
      renderWishlist();
    };

    executeWithLoginPrompt(action);
  }


  function renderSizeSelector() {
    return `
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

  function renderDeviceSelector(category) {
    const devices = category === "iPad Covers"
      ? ["iPad Air", "iPad Pro 11", "iPad Pro 12.9", "iPad Mini"]
      : ["iPhone 13", "iPhone 14", "iPhone 15", "iPhone 15 Pro", "iPhone 15 Pro Max"];
    const options = devices.map(d => `<option value="${escapeHTML(d)}">${escapeHTML(d)}</option>`).join('');
    return `
                <div class="device-selector">
                    <label for="device-select">Device Model</label>
                    <div class="device-options">
                        <select id="device-select" class="dropdown-select">
                            ${options}
                        </select>
                    </div>
                </div>
            `;
  }

  function openProductModal(productId) {
    const product = productMap[productId];
    const isCover =
      product.category === "Phone Covers" || product.category === "iPad Covers";
    const isMug = product.category === "Mugs";

    let selectorHtml = "";
    if (isCover) {
      selectorHtml = renderDeviceSelector(product.category);
    } else if (!isMug) {
      selectorHtml = renderSizeSelector();
    }

    const safeName = escapeHTML(product.name);
    productModal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close close-btn" data-action="close-modal">&times;</button>
                <div class="modal-body">
                    <div class="modal-product">
                        <img src="${escapeHTML(product.image)}" alt="${safeName}" class="modal-image">
                        <div class="modal-details">
                            <h2>${safeName}</h2>
                            <p class="product-price">₹${product.price}</p>
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
    productModal.classList.add("open");
  }

  function closeProductModal() {
    productModal.classList.remove("open");
  }

  // --- Fullscreen Image Zoom Overlay ---
  const zoomOverlay = document.getElementById("imageZoomOverlay");
  const zoomImage = document.getElementById("zoomOverlayImage");
  const zoomCloseBtn = document.getElementById("zoomCloseBtn");
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const zoomResetBtn = document.getElementById("zoomResetBtn");
  const zoomImageContainer = document.getElementById("zoomImageContainer");

  let zoomScale = 1;
  let zoomTranslateX = 0;
  let zoomTranslateY = 0;
  let isDraggingZoom = false;
  let startDragX = 0;
  let startDragY = 0;

  function updateZoomTransform() {
    if (zoomImage) {
      zoomImage.style.transform = `translate(${zoomTranslateX}px, ${zoomTranslateY}px) scale(${zoomScale})`;
    }
  }

  function openZoomOverlay(imageSrc) {
    if (!zoomOverlay || !zoomImage) return;
    zoomImage.src = imageSrc;
    zoomScale = 1;
    zoomTranslateX = 0;
    zoomTranslateY = 0;
    updateZoomTransform();
    zoomOverlay.classList.add("open");
    document.body.style.overflow = "hidden"; // Lock page scroll
  }

  function closeZoomOverlay() {
    if (!zoomOverlay) return;
    zoomOverlay.classList.remove("open");
    // Restore body scroll if product modal is not open
    if (productModal && !productModal.classList.contains("open")) {
      document.body.style.overflow = "";
    }
  }

  if (zoomCloseBtn) {
    zoomCloseBtn.addEventListener("click", closeZoomOverlay);
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      zoomScale = Math.min(zoomScale + 0.25, 4); // Max 4x scale
      updateZoomTransform();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      zoomScale = Math.max(zoomScale - 0.25, 0.5); // Min 0.5x scale
      updateZoomTransform();
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", () => {
      zoomScale = 1;
      zoomTranslateX = 0;
      zoomTranslateY = 0;
      updateZoomTransform();
    });
  }

  // Handle drag and pan
  if (zoomImageContainer) {
    zoomImageContainer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDraggingZoom = true;
      startDragX = e.clientX - zoomTranslateX;
      startDragY = e.clientY - zoomTranslateY;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDraggingZoom) return;
      zoomTranslateX = e.clientX - startDragX;
      zoomTranslateY = e.clientY - startDragY;
      updateZoomTransform();
    });

    window.addEventListener("mouseup", () => {
      isDraggingZoom = false;
    });

    // Touch events for mobile dragging
    zoomImageContainer.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        isDraggingZoom = true;
        startDragX = e.touches[0].clientX - zoomTranslateX;
        startDragY = e.touches[0].clientY - zoomTranslateY;
      }
    }, { passive: true });

    zoomImageContainer.addEventListener("touchmove", (e) => {
      if (!isDraggingZoom) return;
      if (e.touches.length === 1) {
        zoomTranslateX = e.touches[0].clientX - startDragX;
        zoomTranslateY = e.touches[0].clientY - startDragY;
        updateZoomTransform();
      }
    }, { passive: true });

    zoomImageContainer.addEventListener("touchend", () => {
      isDraggingZoom = false;
    });
  }

  // Close Zoom Overlay on ESC key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && zoomOverlay && zoomOverlay.classList.contains("open")) {
      closeZoomOverlay();
    }
  });

  if (productModal) {
    productModal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-image")) {
        openZoomOverlay(e.target.src);
      } else if (e.target.dataset.action === "close-modal") {
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
  }

  function addToCart(productId, selection, quantity) {
    const action = () => {
      let existingItem = null;
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId && cart[i].selection === selection) {
          existingItem = cart[i];
          break;
        }
      }
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ id: productId, selection, quantity });
      }
      saveState();
      updateCartBadge();
      renderCart();
      showNotification("Added to cart");
    };

    executeWithLoginPrompt(action);
  }

  function renderSidebar(options) {
    const { element, title, closeAction, emptyMessage, itemsHTML, footerHTML } =
      options;
    element.innerHTML = `
                <div class="sidebar-header">
                    <h3>${title}</h3>
                    <button class="close-btn" data-action="${closeAction}">&times;</button>
                </div>
                ${
                  itemsHTML
                    ? `<div class="sidebar-items">${itemsHTML}</div>`
                    : `<div class="sidebar-empty">
                    <p>${emptyMessage}</p>
                </div>`
                }
                ${
                  footerHTML
                    ? `<div class="sidebar-footer">
                    ${footerHTML}
                </div>`
                    : ""
                }
            `;
  }

  function renderCart() {
    let itemsHTML = null;
    let footerHTML = null;

    if (cart.length > 0) {
      itemsHTML = cart
        .map((item) => {
          const product = productMap[item.id];
          return `
                    <div class="cart-item" data-id="${
                      item.id
                    }" data-selection="${escapeHTML(item.selection)}">
                        <img src="${
                          escapeHTML(product.image)
                        }" alt="${escapeHTML(product.name)}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${escapeHTML(product.name)}</p>
                            <p class="cart-item-size">${escapeHTML(item.selection)}</p>
                            <p class="cart-item-price">₹${product.price}</p>
                            <div class="cart-item-actions">
                                <button class="qty-btn" data-action="decrease-cart-qty">-</button>
                                <span class="qty-display">${item.quantity}</span>
                                <button class="qty-btn" data-action="increase-cart-qty">+</button>
                                <button class="remove-btn" data-action="remove-from-cart">Remove</button>
                            </div>
                        </div>
                    </div>
                `;
        })
        .join("");

      const total = cart.reduce((acc, item) => {
        const product = productMap[item.id];
        return acc + product.price * item.quantity;
      }, 0);

      footerHTML = `
                    <div class="cart-total">
                        <span>Total</span>
                        <span>₹${total.toFixed(2)}</span>
                    </div>
                    <button class="checkout-btn" data-action="checkout">Checkout</button>
                `;
    }

    renderSidebar({
      element: cartSidebar,
      title: "Your Cart",
      closeAction: "close-cart",
      emptyMessage: "Your cart is empty",
      itemsHTML,
      footerHTML,
    });
  }

  function renderWishlist() {
    let itemsHTML = null;

    if (wishlist.length > 0) {
      itemsHTML = wishlist
        .map((productId) => {
          const product = productMap[productId];
          const safeName = escapeHTML(product.name);
          return `
                    <div class="cart-item" data-id="${product.id}">
                        <img src="${escapeHTML(product.image)}" alt="${safeName}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${safeName}</p>
                            <p class="cart-item-price">₹${product.price}</p>
                             <button class="remove-btn" data-action="remove-from-wishlist">Remove</button>
                        </div>
                    </div>
                `;
        })
        .join("");
    }

    renderSidebar({
      element: wishlistSidebar,
      title: "Your Wishlist",
      closeAction: "close-wishlist",
      emptyMessage: "Your wishlist is empty",
      itemsHTML,
      footerHTML: '<button class="checkout-btn">Sign in to save</button>',
    });
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
      let item = null;
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId && cart[i].selection === selection) {
          item = cart[i];
          break;
        }
      }
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
      let item = null;
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId && cart[i].selection === selection) {
          item = cart[i];
          break;
        }
      }
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
        document.getElementById(`wishlist-btn-${productId}`),
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

  function renderCouples() {
    const couplesGrid = document.getElementById("couplesGrid");
    if (!couplesGrid) return;

    // Find all products with the 'couplegoals' tag
    const coupleProducts = productsByTag["couplegoals"] || [];

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

    couplesGrid.innerHTML = pairs
      .map((pair) => {
        const [item1, item2] = pair;
        const bundlePrice = (item1.price + item2.price) * 0.9; // 10% off for bundle
        const safeName1 = escapeHTML(item1.name);
        const safeName2 = escapeHTML(item2.name);
        const safeImage1 = escapeHTML(item1.image);
        const safeImage2 = escapeHTML(item2.image);

        return `
                <div class="couple-card">
                    <div class="couple-products">
                        <div class="couple-product-wrapper">
                            <img src="${safeImage1}" alt="${safeName1}" class="couple-product-img">
                        </div>
                        <div class="couple-product-wrapper">
                            <img src="${safeImage2}" alt="${safeName2}" class="couple-product-img">
                        </div>
                    </div>
                    <div>
                        <h3 class="bundle-title">${safeName1} + ${safeName2}</h3>
                        <p class="bundle-desc">Perfect match combo. Save 10% when you buy together!</p>
                    </div>
                    <div class="bundle-price-row">
                        <div>
                            <span class="old-price">₹${(
                              item1.price + item2.price
                            ).toFixed(2)}</span>
                            <span class="bundle-price">₹${bundlePrice.toFixed(
                              2,
                            )}</span>
                        </div>
                        <button class="bundle-btn" data-id1="${
                          item1.id
                        }" data-id2="${item2.id}">Add Bundle</button>
                    </div>
                </div>
            `;
      })
      .join("");

    couplesGrid.addEventListener("click", (e) => {
      if (e.target.classList.contains("bundle-btn")) {
        const id1 = parseInt(e.target.dataset.id1);
        const id2 = parseInt(e.target.dataset.id2);

        // Add both to cart with default sizes if applicable
        const product1 = productMap[id1];
        const product2 = productMap[id2];

        addToCart(id1, getSelection(product1), 1);
        addToCart(id2, getSelection(product2), 1);

        cartSidebar.classList.add("open");
        sidebarOverlay.classList.add("active");
      }
    });
  }

  // --- Search Input and Clear Button Event Handlers ---
  if (gallerySearchInput && searchClearBtn) {
    gallerySearchInput.addEventListener("input", () => {
      searchQuery = gallerySearchInput.value;
      if (searchQuery.trim().length > 0) {
        searchClearBtn.style.display = "flex";
      } else {
        searchClearBtn.style.display = "none";
      }
      renderProducts();
    });

    searchClearBtn.addEventListener("click", () => {
      gallerySearchInput.value = "";
      searchQuery = "";
      searchClearBtn.style.display = "none";

      // Reset tag and category filters
      activeCategory = "all";
      activeTag = "all";

      categoryFilters.forEach((f) => f.classList.remove("active"));
      filterTags.forEach((t) => t.classList.remove("active"));
      const allTagBtn = Array.from(filterTags).find((t) => t.dataset.filter === "all");
      if (allTagBtn) {
        allTagBtn.classList.add("active");
      }

      renderProducts();
    });
  }

  // --- Featured Designs Carousel Component Setup ---
  const carouselTrack = document.getElementById("carouselTrack");
  const carouselPrevBtn = document.getElementById("carouselPrevBtn");
  const carouselNextBtn = document.getElementById("carouselNextBtn");
  const carouselIndicators = document.getElementById("carouselIndicators");

  if (carouselContainer && carouselTrack) {
    const slides = Array.from(carouselTrack.children);
    const slideCount = slides.length;
    let currentSlide = 0;

    // Generate indicator dots dynamically
    if (carouselIndicators) {
      carouselIndicators.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = `indicator-dot ${i === 0 ? "active" : ""}`;
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => {
          goToSlide(i);
        });
        carouselIndicators.appendChild(dot);
      });
    }

    function updateParallax(index) {
      // Apply parallax effect to slide images during transition
      slides.forEach((slide, i) => {
        const img = slide.querySelector(".slide-img");
        if (img) {
          // Slide translation parallax offset. Active slide is at 0 offset.
          // Slide to the right has positive offset, slide to the left has negative.
          const offset = (i - index) * 50; // 50px parallax offset
          img.style.setProperty("--parallax-offset", `${offset}px`);
        }
      });
    }

    function goToSlide(index) {
      // Wrap around
      if (index < 0) {
        currentSlide = slideCount - 1;
      } else if (index >= slideCount) {
        currentSlide = 0;
      } else {
        currentSlide = index;
      }

      // Translate track
      carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

      // Update dots
      if (carouselIndicators) {
        const dots = carouselIndicators.querySelectorAll(".indicator-dot");
        dots.forEach((dot, idx) => {
          if (idx === currentSlide) {
            dot.classList.add("active");
          } else {
            dot.classList.remove("active");
          }
        });
      }

      // Parallax update
      updateParallax(currentSlide);
    }

    // Navigation buttons click listeners
    if (carouselPrevBtn) {
      carouselPrevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        goToSlide(currentSlide - 1);
      });
    }

    if (carouselNextBtn) {
      carouselNextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        goToSlide(currentSlide + 1);
      });
    }

    // Keyboard navigation when container is focused or in view
    carouselContainer.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(currentSlide - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(currentSlide + 1);
      }
    });

    // IntersectionObserver to support keyboard navigation when scrolled into view
    let isCarouselVisible = false;
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isCarouselVisible = entry.isIntersecting;
        });
      }, { threshold: 0.4 });
      observer.observe(carouselContainer);
    }

    window.addEventListener("keydown", (e) => {
      // Only trigger global keyboard nav if carousel is visible and active input/textarea is not focused
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable);
      
      if (isCarouselVisible && !isInputFocused) {
        if (e.key === "ArrowLeft") {
          goToSlide(currentSlide - 1);
        } else if (e.key === "ArrowRight") {
          goToSlide(currentSlide + 1);
        }
      }
    });

    // Touch & Swipe Logic
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    carouselTrack.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isSwiping = true;
    }, { passive: true });

    carouselTrack.addEventListener("touchmove", (e) => {
      if (!isSwiping) return;
      const touch = e.touches[0];
      const diffX = touch.clientX - startX;
      const diffY = touch.clientY - startY;

      // Predominantly horizontal swipe: prevent vertical scrolling
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    carouselTrack.addEventListener("touchend", (e) => {
      if (!isSwiping) return;
      isSwiping = false;
      const touch = e.changedTouches[0];
      const diffX = touch.clientX - startX;
      const diffY = touch.clientY - startY;

      const swipeThreshold = 50; // threshold in pixels
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
          goToSlide(currentSlide - 1); // swipe right -> prev slide
        } else {
          goToSlide(currentSlide + 1); // swipe left -> next slide
        }
      }
    }, { passive: true });

    // --- Carousel Auto Scroll ---
    let autoscrollInterval = null;

    function startAutoscroll() {
      stopAutoscroll();
      autoscrollInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 4000);
    }

    function stopAutoscroll() {
      if (autoscrollInterval) {
        clearInterval(autoscrollInterval);
        autoscrollInterval = null;
      }
    }

    // Event listeners to pause autoscroll on user interaction
    carouselContainer.addEventListener("mouseenter", stopAutoscroll);
    carouselContainer.addEventListener("mouseleave", startAutoscroll);
    carouselContainer.addEventListener("touchstart", stopAutoscroll, { passive: true });
    carouselContainer.addEventListener("touchend", startAutoscroll, { passive: true });
    carouselContainer.addEventListener("focusin", stopAutoscroll);
    carouselContainer.addEventListener("focusout", startAutoscroll);

    // Initialize parallax offsets and start autoscroll
    updateParallax(0);
    startAutoscroll();
  }

  // --- Carousel Details Link Navigation ---
  if (carouselContainer) {
    carouselContainer.addEventListener("click", (e) => {
      const detailsBtn = e.target.closest(".view-details-btn");
      if (detailsBtn) {
        e.preventDefault();
        const id = parseInt(detailsBtn.dataset.id);
        window.location.href = `product.html?id=${id}`;
      }
    });
  }

  // --- Product Detail Page (PDP) Dynamic Data Loader ---
  const pdpContainer = document.getElementById("productDetailContainer");
  if (pdpContainer) {
    const pdpSkeleton = document.getElementById("pdpSkeleton");
    const productNotFound = document.getElementById("productNotFound");
    const pdpProductImage = document.getElementById("pdpProductImage");
    const pdpProductTitle = document.getElementById("pdpProductTitle");
    const pdpProductPrice = document.getElementById("pdpProductPrice");
    const pdpProductDesc = document.getElementById("pdpProductDesc");
    const pdpSelectorContainer = document.getElementById("pdpSelectorContainer");
    const pdpQtyDec = document.getElementById("pdpQtyDec");
    const pdpQtyInc = document.getElementById("pdpQtyInc");
    const pdpQtyDisplay = document.getElementById("pdpQtyDisplay");
    const pdpAddToCartBtn = document.getElementById("pdpAddToCartBtn");
    const pdpWishlistBtn = document.getElementById("pdpWishlistBtn");

    // 1. Get Product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("id"));
    const product = products.find((p) => p.id === productId);

    if (pdpSkeleton) pdpSkeleton.style.display = "none";

    if (product) {
      // Show product details container
      pdpContainer.style.display = "grid";

      // Inject data
      if (pdpProductTitle) pdpProductTitle.textContent = product.name;
      if (pdpProductPrice) pdpProductPrice.textContent = `₹${product.price}`;
      if (pdpProductDesc) {
        if (product.category === "T-Shirts" || product.category === "Hoodies") {
          pdpProductDesc.textContent = `${product.name} - Custom fit graphic apparel designed with high-quality screenprinting. Crafted with 100% premium soft-combed cotton for maximum aesthetic appeal, breathability, and all-day comfort.`;
        } else if (product.category === "Mugs") {
          pdpProductDesc.textContent = `${product.name} - Minimalist ceramic design mug with gloss finish. Microwave and dishwasher safe, perfect for morning coffee, evening tea, and coding sprints.`;
        } else {
          pdpProductDesc.textContent = `${product.name} - Sleek protective cover built with premium shockproof TPU borders and a high-resolution gloss graphic backplate, designed to guard your device without adding bulk.`;
        }
      }
      if (pdpProductImage) {
        pdpProductImage.src = product.image;
        pdpProductImage.alt = product.name;
        // Wire up tap-to-zoom fullscreen overlay
        pdpProductImage.addEventListener("click", () => {
          openZoomOverlay(product.image);
        });
      }

      // Dynamically update document title
      document.title = `.studio | ${product.name}`;

      // Render selectors (Device or Size)
      const isCover = product.category === "Phone Covers" || product.category === "iPad Covers";
      const isMug = product.category === "Mugs";
      if (pdpSelectorContainer) {
        if (isCover) {
          pdpSelectorContainer.innerHTML = renderDeviceSelector(product.category);
        } else if (!isMug) {
          pdpSelectorContainer.innerHTML = renderSizeSelector();
        }
      }

      // Wishlist active state check
      const wishlistSet = new Set(wishlist);
      if (pdpWishlistBtn) {
        if (wishlistSet.has(product.id)) {
          pdpWishlistBtn.classList.add("active");
        }
        
        pdpWishlistBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const id = product.id;
          const index = wishlist.indexOf(id);
          if (index > -1) {
            wishlist.splice(index, 1);
            pdpWishlistBtn.classList.remove("active");
            showNotification("Removed from wishlist");
          } else {
            wishlist.push(id);
            pdpWishlistBtn.classList.add("active");
            showNotification("Added to wishlist");
          }
          saveState();
          renderWishlist();
          updateWishlistBadge();
        });
      }

      // Quantity selector event listeners
      let quantity = 1;
      if (pdpQtyDec) {
        pdpQtyDec.addEventListener("click", () => {
          if (quantity > 1) {
            quantity--;
            pdpQtyDisplay.textContent = quantity;
          }
        });
      }
      if (pdpQtyInc) {
        pdpQtyInc.addEventListener("click", () => {
          quantity++;
          pdpQtyDisplay.textContent = quantity;
        });
      }

      // Add to Cart event listener
      if (pdpAddToCartBtn) {
        pdpAddToCartBtn.addEventListener("click", () => {
          const sizeSelect = document.getElementById("size-select");
          const deviceSelect = document.getElementById("device-select");
          let selection = "N/A";
          if (sizeSelect) {
            selection = sizeSelect.value;
          } else if (deviceSelect) {
            selection = deviceSelect.value || "N/A";
          }

          addToCart(product.id, selection, quantity);
          
          // Open cart sidebar automatically
          if (cartSidebar && sidebarOverlay) {
            cartSidebar.classList.add("open");
            sidebarOverlay.classList.add("active");
          }
        });
      }

    } else {
      // Show elegant "Product Not Found" screen
      if (productNotFound) productNotFound.style.display = "flex";
      document.title = ".studio | Product Not Found";
    }
  }

  if (productsGrid) {
    renderProducts();
    renderCouples();
  }
  renderCart();
  renderWishlist();
  updateCartBadge();
  updateWishlistBadge();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getCookie, setCookie, BackendAPI };
}
