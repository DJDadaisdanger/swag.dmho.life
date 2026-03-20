const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the app
  await page.goto('http://localhost:8000/index.html');

  // Inject malicious payload into localstorage
  await page.evaluate(() => {
    localStorage.setItem('cart', JSON.stringify([{
      id: 8,
      name: '<img src=x onerror="document.body.innerHTML=`HACKED`">',
      price: 39.99,
      selection: '<script>alert("XSS")</script>',
      quantity: 1
    }]));
  });

  // Reload to let app.js render the payload
  await page.reload();

  // Open cart to see if payload executes
  await page.click('#cartBtn');

  // Check for presence of unescaped payload or "HACKED" body
  await page.waitForTimeout(1000);

  const innerHTML = await page.content();

  if (innerHTML.includes('HACKED')) {
    console.error("VULNERABLE: XSS payload executed!");
    process.exit(1);
  } else if (innerHTML.includes('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')) {
     console.log("SECURE: Payload was escaped correctly.");
  } else {
     console.log("UNKNOWN: Payload not found or not escaped as expected.");
  }

  await browser.close();
})();
