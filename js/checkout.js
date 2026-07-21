document.addEventListener('DOMContentLoaded', async () => {
    const orderItems = document.getElementById('summary-items');
    const totalPrice = document.getElementById('summary-total');
    const backToShopBtn = document.querySelector('.back-to-shop-btn');
    const paymentForm = document.getElementById('payment-form');
    
    // Check authentication first
    try {
        // TODO: Check authentication via backend
        throw new Error("Backend authentication not implemented");
    } catch (e) {
        alert('Authentication failed. Please log in.');
        window.location.href = '/';
        return;
    }

    // Fetch products dynamically
    const products = await (typeof getProducts !== 'undefined' ? getProducts() : window.getProducts());

    // Load cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        if (orderItems) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'Your cart is empty.';
            orderItems.appendChild(emptyMsg);
        }
        if (totalPrice) {
            totalPrice.textContent = '₹0.00';
        }
    } else {
        let total = 0;
        cart.forEach(item => {
            // Find product details from fetched products array
            const product = products.find(p => p.id === item.id);
            if (!product) return; // Skip if product not found
            
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item', 'summary-item');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${product.name} (${item.selection}) x ${item.quantity}`;

            const priceSpan = document.createElement('span');
            const itemTotal = product.price * item.quantity;
            priceSpan.textContent = `₹${itemTotal.toFixed(2)}`;

            orderItem.appendChild(nameSpan);
            orderItem.appendChild(priceSpan);

            if (orderItems) {
                orderItems.appendChild(orderItem);
            }
            total += itemTotal;
        });
        if (totalPrice) {
            totalPrice.textContent = `₹${total.toFixed(2)}`;
        }
    }

    if (backToShopBtn) {
        backToShopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/';
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (cart.length === 0) {
                alert('Your cart is empty.');
                return;
            }

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const address = document.getElementById('address').value;
            const phone = document.getElementById('phone').value.trim();
            const phoneError = document.getElementById('phone-error');

            // Strict client-side validation for 10-digit phone
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                if (phoneError) phoneError.style.display = 'block';
                return;
            } else {
                if (phoneError) phoneError.style.display = 'none';
            }

            const submitBtn = paymentForm.querySelector('.checkout-btn');
            
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            try {
                // TODO: Implement checkout API call
                throw new Error("Checkout API not implemented (waiting for backend).");
            } catch (error) {
                alert('An error occurred during checkout. Please try again.');
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
