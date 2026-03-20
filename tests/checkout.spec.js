const { test, expect } = require('@playwright/test');

test.describe('Checkout Flow', () => {
  test('should render cart items and total correctly from localStorage', async ({ page }) => {
    // Navigate to a page on the domain to establish origin for localStorage
    await page.goto('/index.html');

    // Inject mock cart data
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { id: 1, name: 'Test Product 1', price: 29.99, quantity: 2 },
        { id: 2, name: 'Test Product 2', price: 15.50, quantity: 1 }
      ]));
    });

    // Navigate to the checkout page
    await page.goto('/checkout.html');

    // Wait for and verify the order items
    const summaryItems = page.locator('#summary-items');
    await expect(summaryItems).toContainText('Test Product 1 x 2');
    await expect(summaryItems).toContainText('Test Product 2 x 1');

    // Verify the total price matches expected calculation: (29.99*2) + 15.50 = 75.48
    const summaryTotal = page.locator('#summary-total');
    await expect(summaryTotal).toHaveText('$75.48');
  });
});
