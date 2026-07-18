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
    // TODO: Fetch user data (wishlist, cart, authentication status) from backend
    return { wishlist: [], cart: [], isLoggedIn: false, hasSeenLoginPrompt: false, userEmail: null };
  },

  async register(email, password, phone) {
    // TODO: Implement registration API call
    throw new Error("Registration not implemented (waiting for backend).");
  },

  async login(email, password) {
    // TODO: Implement login API call
    throw new Error("Login not implemented (waiting for backend).");
  },

  async logout() {
    // TODO: Implement logout API call
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
  },

  async syncData(cart, wishlist, isLoggedIn) {
    // TODO: Implement data synchronization with backend
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }
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
  let userEmail = userData.userEmail || null;

  if (isLoggedIn) {
    document.body.classList.add('logged-in');
  }

  if (new URLSearchParams(window.location.search).get('login') === 'true') {
    setTimeout(() => showLoginPrompt(), 100);
  }

  let activeCategory = "all";
  let activeTag = "all";
  const gallerySearchInput = document.getElementById("gallerySearchInput");
  const searchClearBtn = document.getElementById("searchClearBtn");
  const carouselContainer = document.getElementById("featuredCarouselContainer");
  const categoriesSection = document.getElementById("categoriesSection");
  let searchQuery = "";

  // --- Filter Bar Scroll Logic ---
  const filterScrollNextBtn = document.getElementById("filterScrollNextBtn");
  const filterScrollPrevBtn = document.getElementById("filterScrollPrevBtn");
  const filterBar = document.querySelector(".filter-bar");

  if (filterBar) {
    filterBar.style.scrollbarWidth = "none";

    const updateScrollButtons = () => {
      if (!filterScrollNextBtn || !filterScrollPrevBtn) return;
      const isAtStart = filterBar.scrollLeft <= 5;
      const isAtEnd = Math.abs(filterBar.scrollWidth - filterBar.clientWidth - filterBar.scrollLeft) <= 5;

      filterScrollPrevBtn.style.opacity = isAtStart ? "0" : "1";
      filterScrollPrevBtn.style.pointerEvents = isAtStart ? "none" : "auto";
      filterScrollNextBtn.style.opacity = isAtEnd ? "0" : "1";
      filterScrollNextBtn.style.pointerEvents = isAtEnd ? "none" : "auto";
    };

    if (filterScrollNextBtn) filterScrollNextBtn.addEventListener("click", () => filterBar.scrollBy({ left: 200, behavior: "smooth" }));
    if (filterScrollPrevBtn) filterScrollPrevBtn.addEventListener("click", () => filterBar.scrollBy({ left: -200, behavior: "smooth" }));

    let isDraggingFilter = false;
    let startXFilter;
    let scrollLeftFilter;

    filterBar.addEventListener("mousedown", (e) => {
      isDraggingFilter = true;
      startXFilter = e.pageX - filterBar.offsetLeft;
      scrollLeftFilter = filterBar.scrollLeft;
    });

    filterBar.addEventListener("mouseleave", () => isDraggingFilter = false);
    filterBar.addEventListener("mouseup", () => isDraggingFilter = false);
    filterBar.addEventListener("mousemove", (e) => {
      if (!isDraggingFilter) return;
      e.preventDefault();
      const x = e.pageX - filterBar.offsetLeft;
      filterBar.scrollLeft = scrollLeftFilter - (x - startXFilter) * 1.5;
    });

    let scrollTicking = false;
    filterBar.addEventListener("scroll", () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          updateScrollButtons();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    });
    window.addEventListener("resize", updateScrollButtons);
    setTimeout(updateScrollButtons, 100);
  }
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

  const loginSidebar = document.getElementById("loginSidebar");
  const loginForm = document.getElementById("loginForm");

  function openLoginSlide() {
    loginSidebar.classList.add("open");
    sidebarOverlay.classList.add("active");
  }

  function closeLoginSlide() {
    loginSidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
  }

  if (loginSidebar) {
    loginSidebar.addEventListener("click", (e) => {
      if (e.target.dataset.action === "close-login") {
        closeLoginSlide();
        processLoginQueue(false);
      }
    });
  }

  // --- Nav user display ---
  function renderNavUser() {
    const navIcons = document.querySelector(".nav-icons");
    if (!navIcons) return;
    const existing = document.getElementById("navUserPill");
    if (existing) existing.remove();
    if (isLoggedIn && userEmail) {
      const pill = document.createElement("div");
      pill.id = "navUserPill";
      pill.className = "nav-user-pill";
      pill.innerHTML = `
        <span class="nav-user-email">${escapeHTML(userEmail)}</span>
        <button class="nav-logout-btn" id="logoutBtn" aria-label="Logout">Sign out</button>
      `;
      navIcons.prepend(pill);
      document.getElementById("logoutBtn").addEventListener("click", async () => {
        await BackendAPI.logout();
        isLoggedIn = false;
        userEmail = null;
        cart = [];
        wishlist = [];
        document.body.classList.remove('logged-in');
        renderNavUser();
        renderCart();
        renderWishlist();
        updateCartBadge();
        updateWishlistBadge();
        renderProducts();
      });
    }
  }

  // --- Auth form: login + register tab logic ---
  const loginSidebarEl = loginSidebar;
  const authTabBtns = loginSidebarEl ? loginSidebarEl.querySelectorAll(".auth-tab-btn") : [];
  const loginPanel = loginSidebarEl ? loginSidebarEl.querySelector("#loginPanel") : null;
  const registerPanel = loginSidebarEl ? loginSidebarEl.querySelector("#registerPanel") : null;

  authTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      authTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.tab;
      if (loginPanel) loginPanel.style.display = target === "login" ? "flex" : "none";
      if (registerPanel) registerPanel.style.display = target === "register" ? "flex" : "none";
      // clear errors
      loginSidebarEl.querySelectorAll(".auth-error").forEach(el => el.remove());
    });
  });

  // Helper: handle successful auth
  async function onAuthSuccess() {
    const meRes = await fetch("/api/me");
    const me = await meRes.json();
    if (!me.authenticated) return;
    isLoggedIn = true;
    userEmail = me.email;
    hasSeenLoginPrompt = true;
    document.body.classList.add('logged-in');

    // Load server cart/wishlist
    try {
      const cartRes = await fetch("/api/cart");
      if (cartRes.ok) {
        const d = await cartRes.json();
        cart = d.cart || [];
        wishlist = d.wishlist || [];
        localStorage.setItem("cart", JSON.stringify(cart));
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
      }
    } catch (_) { }
    renderNavUser();
    closeLoginSlide();
    processLoginQueue(true);
    renderCart();
    renderWishlist();
    updateCartBadge();
    updateWishlistBadge();
  }

  // Login form
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const submitBtn = loginForm.querySelector("button[type='submit']");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Signing in…";
      submitBtn.disabled = true;
      loginForm.querySelectorAll(".auth-error").forEach(el => el.remove());
      try {
        await BackendAPI.login(email, password);
        await onAuthSuccess();
      } catch (err) {
        const msg = document.createElement("p");
        msg.className = "auth-error";
        msg.textContent = err.message || "Invalid email or password.";
        loginForm.appendChild(msg);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Register form
  const registerForm = loginSidebarEl ? loginSidebarEl.querySelector("#registerForm") : null;
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value;
      const phone = document.getElementById("regPhone").value.trim();
      const regPhoneError = document.getElementById("reg-phone-error");

      // Validate 10-digit phone number
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        if (regPhoneError) regPhoneError.style.display = "block";
        return;
      } else {
        if (regPhoneError) regPhoneError.style.display = "none";
      }

      const submitBtn = registerForm.querySelector("button[type='submit']");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Creating account…";
      submitBtn.disabled = true;
      registerForm.querySelectorAll(".auth-error").forEach(el => el.remove());
      try {
        await BackendAPI.register(email, password, phone);
        await onAuthSuccess();
      } catch (err) {
        const msg = document.createElement("p");
        msg.className = "auth-error";
        msg.textContent = err.message || "Registration failed. Try again.";
        registerForm.appendChild(msg);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  function showLoginPrompt(onLogin, onNvm) {
    if (isLoggedIn) {
      if (onLogin) onLogin();
      return;
    }
    enqueueLoginAction(onLogin, onNvm);
    openLoginSlide();
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
    let container = document.getElementById("notification-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "notification-container";
      container.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column-reverse;gap:10px;pointer-events:none;";
      document.body.appendChild(container);
    }

    const notification = document.createElement("div");
    notification.style.cssText = "padding:1rem 1.5rem;width:auto;max-width:300px;height:auto;background:#10b981;color:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);display:flex;align-items:center;gap:10px;flex-shrink:0;pointer-events:auto;transition:all 0.3s ease;opacity:0;transform:translateY(10px);";

    const safeMessage = escapeHTML(message);
    
    let icon = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; min-width: 24px;">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    `;
    if (message.toLowerCase().includes("wishlist")) {
      icon = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; min-width: 24px;">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      `;
    }

    notification.innerHTML = `
      ${icon}
      <span style="white-space: nowrap;">${safeMessage}</span>
    `;

    container.appendChild(notification);
    
    // Trigger animation frame for transition
    requestAnimationFrame(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(10px)";
      setTimeout(() => {
        if (container.contains(notification)) {
          notification.remove();
        }
        if (container.childNodes.length === 0) {
          container.remove();
        }
      }, 300);
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
      if (filteredProducts.length === 0) {
        if (hasQuery) {
          // Search empty state
          productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
              <svg width="48" height="48" fill="none" stroke="#555" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom: 1rem;">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <h3 style="color: #fff; margin-bottom: 0.5rem; font-size: 1.25rem;">No products match your search</h3>
              <p style="color: #888;">Try checking the spelling or using different keywords.</p>
            </div>
          `;
        } else {
          // Category/Filter empty state
          productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
              <svg width="48" height="48" fill="none" stroke="#555" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom: 1rem;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <h3 style="color: #fff; margin-bottom: 0.5rem; font-size: 1.25rem;">Nothing available</h3>
              <p style="color: #888;">We don't have any designs in this category right now.</p>
            </div>
          `;
        }
      } else {
        productsGrid.innerHTML = filteredProducts
          .map((product) => {
            const highlightedName = highlightText(product.name, query);
            return `
                    <div class="product-card" data-id="${product.id}" data-action="open-modal">
                        <button id="wishlist-btn-${product.id}" class="wishlist-btn ${wishlistSet.has(product.id) ? "active" : ""
              }">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        <div class="product-image-wrapper">
                            <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" class="product-image" width="300" height="300" loading="lazy">
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
      renderProducts(); // Ensures product grid is updated
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
                        <img src="${escapeHTML(product.image)}" alt="${safeName}" class="modal-image" width="600" height="600">
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
                ${itemsHTML
        ? `<div class="sidebar-items">${itemsHTML}</div>`
        : `<div class="sidebar-empty">
                    <p>${emptyMessage}</p>
                </div>`
      }
                ${footerHTML
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
                    <div class="cart-item" data-id="${item.id
            }" data-selection="${escapeHTML(item.selection)}">
                        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" class="cart-item-img" width="80" height="80">
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

      let subtotal = cart.reduce((acc, item) => {
        const product = productMap[item.id];
        return acc + product.price * item.quantity;
      }, 0);

      // Calculate bundle discounts
      const itemCounts = {};
      cart.forEach(item => {
        itemCounts[item.id] = (itemCounts[item.id] || 0) + item.quantity;
      });
      
      let discount = 0;
      
      // 1. Pair A Cover (9) + Pair A iPad Cover (12)
      const pairA_count = Math.min(itemCounts[9] || 0, itemCounts[12] || 0);
      if (pairA_count > 0) {
        discount += (productMap[9].price + productMap[12].price) * 0.1 * pairA_count;
      }
      
      // 2. Cute Cover (8) + Cute iPad Cover (11)
      const cute_count = Math.min(itemCounts[8] || 0, itemCounts[11] || 0);
      if (cute_count > 0) {
        discount += (productMap[8].price + productMap[11].price) * 0.1 * cute_count;
      }
      
      // 3. Couple Goals (2) + Couple Goals (2)
      const couple_count = Math.floor((itemCounts[2] || 0) / 2);
      if (couple_count > 0) {
        discount += (productMap[2].price * 2) * 0.1 * couple_count;
      }

      const total = subtotal - discount;

      footerHTML = `
                    <div class="cart-total">
                        <span>Total</span>
                        <span>
                            ${discount > 0 ? `<span style="text-decoration: line-through; color: #888; font-size: 0.9em; margin-right: 8px;">₹${subtotal.toFixed(2)}</span>` : ""}
                            ₹${total.toFixed(2)}
                        </span>
                    </div>
                    ${discount > 0 ? `<div style="color: #10b981; font-size: 0.9em; margin-bottom: 15px;">Bundle Discount Applied: -₹${discount.toFixed(2)}</div>` : ""}
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
                        <img src="${escapeHTML(product.image)}" alt="${safeName}" class="cart-item-img" width="80" height="80">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${safeName}</p>
                            <p class="cart-item-price">₹${product.price}</p>
                            <div style="display:flex;gap:0.5rem;margin-top:0.5rem;align-items:center;">
                                <button class="remove-btn" data-action="remove-from-wishlist" style="margin:0;padding:0.25rem 0.5rem;min-height:30px;min-width:auto;">Remove</button>
                                <button class="checkout-btn" data-action="wishlist-add-to-cart" style="margin:0;padding:0.25rem 0.5rem;font-size:0.8rem;min-height:30px;width:auto;background:#3b82f6;">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `;
        })
        .join("");
    }

    let footerHTML = "";
    if (wishlist.length > 0) {
      footerHTML = `<button class="checkout-btn" data-action="wishlist-move-all" style="background:#10b981;">Move All to Cart</button>`;
    } else if (!isLoggedIn) {
      footerHTML = '<button class="checkout-btn" data-action="login">Sign in to save</button>';
    }

    renderSidebar({
      element: wishlistSidebar,
      title: "Your Wishlist",
      closeAction: "close-wishlist",
      emptyMessage: "Your wishlist is empty",
      itemsHTML,
      footerHTML,
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
      showLoginPrompt(() => {
        window.location.href = "checkout.html";
      });
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
    } else if (e.target.dataset.action === "wishlist-add-to-cart") {
      const cartItem = e.target.closest(".cart-item");
      const productId = parseInt(cartItem.dataset.id);
      const product = productMap[productId];
      const selection = getSelection(product);
      
      addToCart(productId, selection, 1);
      
      wishlist = wishlist.filter(id => id !== productId);
      const wishlistBtn = document.getElementById(`wishlist-btn-${productId}`);
      if (wishlistBtn) wishlistBtn.classList.remove("active");
      
      saveState();
      renderWishlist();
      updateWishlistBadge();
      renderProducts(); // Ensures product grid is updated
    } else if (e.target.dataset.action === "wishlist-move-all") {
      wishlist.forEach(productId => {
        const product = productMap[productId];
        const selection = getSelection(product);
        
        let existingItem = null;
        for (let i = 0; i < cart.length; i++) {
          if (cart[i].id === productId && cart[i].selection === selection) {
            existingItem = cart[i];
            break;
          }
        }
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({ id: productId, selection, quantity: 1 });
        }
        
        const wishlistBtn = document.getElementById(`wishlist-btn-${productId}`);
        if (wishlistBtn) wishlistBtn.classList.remove("active");
      });
      
      wishlist = [];
      saveState();
      renderWishlist();
      renderCart();
      updateWishlistBadge();
      updateCartBadge();
      renderProducts(); // Ensures product grid is updated
      showNotification("All items moved to cart");
    } else if (e.target.dataset.action === "login") {
      wishlistSidebar.classList.remove("open");
      showLoginPrompt();
    }
  });

  sidebarOverlay.addEventListener("click", () => {
    cartSidebar.classList.remove("open");
    wishlistSidebar.classList.remove("open");
    if (loginSidebar) {
      loginSidebar.classList.remove("open");
      processLoginQueue(false);
    }
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
      if (tag.classList.contains("active") && tag.dataset.filter !== "all") {
        tag.classList.remove("active");
        activeTag = "all";
        const allBtn = Array.from(filterTags).find(t => t.dataset.filter === "all");
        if (allBtn) allBtn.classList.add("active");
      } else {
        filterTags.forEach((t) => t.classList.remove("active"));
        tag.classList.add("active");
        activeTag = tag.dataset.filter;
      }
      renderProducts();
    });
  });

  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      if (filter.classList.contains("active")) {
        filter.classList.remove("active");
        // Reset styles
        filter.style.backgroundColor = "";
        filter.style.boxShadow = "";
        activeCategory = "all";
      } else {
        categoryFilters.forEach((f) => {
          f.classList.remove("active");
          f.style.backgroundColor = "";
          f.style.boxShadow = "";
        });
        filter.classList.add("active");
        // Use a subtle transparent blue background + an inner blue border
        filter.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
        filter.style.boxShadow = "inset 0 0 0 2px #3b82f6";
        activeCategory = filter.dataset.category;
      }
      renderProducts();
    });
  });

  function renderCouples() {
    const couplesGrid = document.getElementById("couplesGrid");
    if (!couplesGrid) return;

    const pairs = [];
    
    // 1st Bundle: Pair A Cover + Pair A iPad Cover
    if (productMap[9] && productMap[12]) {
        pairs.push([productMap[9], productMap[12]]);
    }
    
    // 2nd Bundle: Cute Cover + Cute iPad Cover
    if (productMap[8] && productMap[11]) {
        pairs.push([productMap[8], productMap[11]]);
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
                            <img src="${safeImage1}" alt="${safeName1}" class="couple-product-img" width="200" height="200" loading="lazy">
                        </div>
                        <div class="couple-product-wrapper">
                            <img src="${safeImage2}" alt="${safeName2}" class="couple-product-img" width="200" height="200" loading="lazy">
                        </div>
                    </div>
                    <div>
                        <h3 class="bundle-title">${safeName1} + ${safeName2}</h3>
                        <p class="bundle-desc">Perfect match combo. Save 10% when you buy together!</p>
                    </div>
                    <div class="bundle-price-row">
                        <div>
                            <span class="old-price" style="text-decoration: line-through; color: #888; margin-right: 0.5rem; font-size: 0.9rem;">₹${(
            item1.price + item2.price
          ).toFixed(2)}</span>
                            <span class="bundle-price">₹${bundlePrice.toFixed(
            2,
          )}</span>
                        </div>
                        <button class="bundle-btn" data-id1="${item1.id
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
    const debouncedRender = debounce(() => {
      renderProducts();
    }, 250);

    gallerySearchInput.addEventListener("input", () => {
      searchQuery = gallerySearchInput.value;
      if (searchQuery.trim().length > 0) {
        searchClearBtn.style.display = "flex";
      } else {
        searchClearBtn.style.display = "none";
      }
      debouncedRender();
    });

    searchClearBtn.addEventListener("click", () => {
      gallerySearchInput.value = "";
      searchQuery = "";
      searchClearBtn.style.display = "none";

      // Reset tag and category filters
      activeCategory = "all";
      activeTag = "all";

      categoryFilters.forEach((f) => {
        f.classList.remove("active");
        f.style.backgroundColor = "";
      });
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

  // --- Carousel Details & Wishlist Link Navigation ---
  if (carouselContainer) {
    carouselContainer.addEventListener("click", (e) => {
      const detailsBtn = e.target.closest(".view-details-btn");
      const slideWishlistBtn = e.target.closest(".slide-wishlist-btn");

      if (detailsBtn) {
        e.preventDefault();
        const id = parseInt(detailsBtn.dataset.id);
        window.location.href = `product.html?id=${id}`;
      } else if (slideWishlistBtn) {
        e.preventDefault();
        const id = parseInt(slideWishlistBtn.dataset.id);
        toggleWishlist(id, slideWishlistBtn);
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
          renderProducts(); // Ensures product grid is updated
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
  // --- Create With Us Form Handler ---
  const designForm = document.getElementById("designForm");
  if (designForm) {
    designForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const designDesc = document.getElementById("designDesc").value;
      const designName = document.getElementById("designName").value;
      const designEmail = document.getElementById("designEmail").value;
      const submitBtn = designForm.querySelector("button[type='submit']");
      const originalText = submitBtn.textContent;

      submitBtn.textContent = "Submitting...";
      submitBtn.disabled = true;

      // Remove previous success or error messages
      const prevMessage = designForm.querySelector(".submit-feedback");
      if (prevMessage) prevMessage.remove();

      try {
        const response = await fetch("/api/design-submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: designName,
            email: designEmail,
            vision: designDesc
          })
        });

        const data = await response.json();

        if (response.ok) {
          designForm.reset();
          const feedback = document.createElement("p");
          feedback.className = "submit-feedback";
          feedback.style.cssText = "color: #10b981; margin-top: 1rem; font-weight: 600; font-size: 0.95rem;";
          feedback.textContent = data.message || "Your vision has been submitted. We'll be in touch!";
          designForm.appendChild(feedback);
        } else {
          throw new Error(data.detail || "Failed to submit vision");
        }
      } catch (error) {
        const feedback = document.createElement("p");
        feedback.className = "submit-feedback";
        feedback.style.cssText = "color: #ef4444; margin-top: 1rem; font-weight: 600; font-size: 0.95rem;";
        feedback.textContent = error.message || "An error occurred. Please try again.";
        designForm.appendChild(feedback);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  renderNavUser();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getCookie, setCookie, BackendAPI };
}