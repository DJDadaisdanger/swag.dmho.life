from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to the app
        page.goto('http://localhost:8000/index.html')

        # Inject malicious payload into cookies
        page.evaluate("""() => {
          document.cookie = 'cart=' + encodeURIComponent(JSON.stringify([{
            id: 8,
            name: '<img src=x onerror="document.body.innerHTML=`HACKED`">',
            price: 39.99,
            selection: '<script>alert("XSS")</script>',
            quantity: 1
          }])) + ';path=/';
        }""")

        # Reload to let app.js render the payload
        page.reload()

        # Open cart to see if payload executes
        page.click('#cartBtn')

        # Check for presence of unescaped payload or "HACKED" body
        page.wait_for_timeout(1000)

        inner_html = page.content()

        if 'HACKED' in inner_html and '<body' in inner_html and 'HACKED' in page.locator('body').inner_html():
            print("VULNERABLE: XSS payload executed!")
            exit(1)
        elif '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;' in inner_html:
            print("SECURE: Payload was escaped correctly.")
        else:
            print("UNKNOWN: Payload not found or not escaped as expected. Output snippet:")
            # Find the cart-item-size div
            cart_html = page.locator('.cart-item-size').nth(0).inner_html() if page.locator('.cart-item-size').count() > 0 else 'Not found'
            print(f"Cart HTML: {cart_html}")

        browser.close()

run()
