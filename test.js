const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the app
  await page.goto('http://localhost:8000/index.html');
  await page.waitForTimeout(1000);
  const title = await page.title();
  if (title === '.studio') {
      console.log('Homepage loads successfully');
  }

  // Find Add to wishlist button on first product
  const wishlistBtn = page.locator('.product-card:first-child .wishlist-btn');
  await wishlistBtn.click();

  await page.waitForTimeout(500);

  // Check if login prompt comes up
  const nvmBtn = page.locator('#nvmBtn');
  if (await nvmBtn.isVisible()) {
      console.log('Login prompt displayed correctly');
      await nvmBtn.click();
  }

  // Open first product modal
  const productImg = page.locator('.product-card:first-child img');
  await productImg.click();

  await page.waitForTimeout(500);

  // Add to cart
  const addToCartBtn = page.locator('.add-to-cart-btn');
  await addToCartBtn.click();

  await page.waitForTimeout(500);

  // Click checkout
  const checkoutBtn = page.locator('.checkout-btn:visible');
  await checkoutBtn.click();

  await page.waitForTimeout(1000);
  console.log('Successfully navigated to ' + page.url());

  await browser.close();
  process.exit(0);
})();
