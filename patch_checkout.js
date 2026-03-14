const fs = require('fs');

let content = fs.readFileSync('checkout.html', 'utf8');

// The prompt wants comments and TO DOs regarding Stripe integration and fetching data from backend.

const jsBlock = `
    <script src="app.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Check if user is logged in
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (!isLoggedIn) {
                // If not logged in, force login to proceed to checkout
                const modalHtml = \`
                    <div class="modal open" id="forceLoginModal" style="z-index: 5000; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9); display: flex; align-items: center; justify-content: center;">
                        <div class="modal-content" style="background: #0f0f0f; border-radius: 12px; max-width: 400px; text-align: center; padding: 2rem;">
                            <h2 style="margin-bottom: 1rem;">Login Required</h2>
                            <p style="margin-bottom: 2rem; color: #888;">You must sign in to proceed to checkout and payment.</p>
                            <div style="display: flex; justify-content: center;">
                                <button id="forceLoginBtn" style="background: #3b82f6; color: #fff; border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Sign In</button>
                            </div>
                        </div>
                    </div>
                \`;
                document.body.insertAdjacentHTML('beforeend', modalHtml);

                document.getElementById('forceLoginBtn').addEventListener('click', () => {
                    localStorage.setItem('isLoggedIn', 'true');
                    window.location.reload();
                });
            }

            // TODO: [Backend Integration] Fetch products, cart, and wishlist from the Python backend
            // Instead of using localStorage, we should use a session cookie / token obtained via OAuth 2.0.
            // Example:
            // fetch('/api/v1/cart', { headers: { 'Authorization': 'Bearer ' + token } })
            //   .then(res => res.json())
            //   .then(data => renderCheckout(data.cart));

            const localCart = JSON.parse(localStorage.getItem('cart')) || [];
            const summaryItemsContainer = document.getElementById('summary-items');
            const summaryTotalContainer = document.getElementById('summary-total');

            if (localCart.length === 0) {
                summaryItemsContainer.innerHTML = '<p style="color: #888;">Your cart is empty.</p>';
                summaryTotalContainer.textContent = '₹0.00';
            } else {
                let total = 0;
                let html = '';

                localCart.forEach(item => {
                    // TODO: [Backend Integration] Price, sale, and discount info should be fetched securely from the backend (SQLite).
                    // Example: product = await fetch(\`/api/v1/products/\${item.id}\`);
                    // We shouldn't rely on the frontend products array for pricing to avoid tampering.

                    const product = products.find(p => p.id === item.id);
                    if (product) {
                        const itemTotal = product.price * item.quantity;
                        total += itemTotal;

                        html += \`
                            <div class="summary-item">
                                <div style="display: flex; gap: 1rem; align-items: center;">
                                    <img src="\${product.image}" alt="\${product.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                                    <div>
                                        <div style="font-weight: 600;">\${product.name}</div>
                                        <div style="font-size: 0.85rem; color: #888;">\${item.selection} x \${item.quantity}</div>
                                    </div>
                                </div>
                                <div style="font-weight: 600;">₹\${itemTotal.toFixed(2)}</div>
                            </div>
                        \`;
                    }
                });

                summaryItemsContainer.innerHTML = html;
                summaryTotalContainer.textContent = '₹' + total.toFixed(2);
            }

            // TODO: [Payment Integration] Stripe Integration
            // 1. Initialize Stripe: const stripe = Stripe('pk_test_YOUR_PUBLIC_KEY');
            // 2. Fetch a PaymentIntent client secret from your Python backend:
            //    const response = await fetch('/api/v1/create-payment-intent', { method: 'POST', body: JSON.stringify({ items: localCart }) });
            //    const { clientSecret } = await response.json();
            // 3. Set up Stripe Elements:
            //    const elements = stripe.elements({ clientSecret });
            //    const paymentElement = elements.create('payment');
            //    paymentElement.mount('#card-element');
            // 4. On form submit:
            //    const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: 'https://your-site.com/success' }});
            // 5. Handle success/error and clear cart.

            const form = document.getElementById('payment-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Payment integration pending. See TODOs in code.');
            });
        });
    </script>
</body>`;

content = content.replace(/<script src="https:\/\/js\.stripe\.com\/v3\/"><\/script>\n<\/body>/, `<script src="https://js.stripe.com/v3/"></script>\n${jsBlock}`);

fs.writeFileSync('checkout.html', content);
