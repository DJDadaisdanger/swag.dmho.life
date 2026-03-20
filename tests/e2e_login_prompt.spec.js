const { test, expect } = require('@playwright/test');

test('login prompt appears on add to cart with empty cart', async ({ page }) => {
  await page.goto('/index.html');

  // Ensure storage is empty
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Click a product card to open the modal
  await page.click('.product-card[data-id="1"]');

  // Click 'Add to Cart' inside the modal
  await page.click('.add-to-cart-btn');

  // Verify that the login prompt modal is visible
  const modal = page.locator('#loginPromptModal');
  await expect(modal).toBeVisible();

  // Click 'Nvm' to dismiss the modal
  await page.click('#nvmBtn');

  // Verify the modal is closed
  await expect(modal).toBeHidden();

  // Verify the cart has exactly 1 item in localStorage
  const cartCount = await page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]').length);
  expect(cartCount).toBe(1);
});
