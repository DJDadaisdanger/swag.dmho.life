const PRODUCTS_CACHE_KEY = 'swag_products_cache';
const PRODUCTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getProducts() {
  const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      if (Date.now() - parsed.timestamp < PRODUCTS_CACHE_TTL) {
        return parsed.products;
      }
    } catch (e) {
      console.warn("Failed to parse cached products", e);
    }
  }

  try {
    const response = await fetch('/api/products');
    if (response.ok) {
      const products = await response.json();
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        products: products
      }));
      return products;
    } else {
      console.error("Failed to fetch products from backend", response.status);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  // Fallback in case of error (could return static mock data here for dev)
  return [];
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = getProducts;
} else {
  window.getProducts = getProducts;
}
