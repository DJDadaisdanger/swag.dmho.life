document.addEventListener('DOMContentLoaded', () => {
    const orderItems = document.getElementById('summary-items');
    const totalPrice = document.getElementById('summary-total');
    const backToShopBtn = document.querySelector('.back-to-shop-btn');

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        if (orderItems) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'Your cart is empty.';
            orderItems.appendChild(emptyMsg);
        }
    } else {
        let total = 0;
        cart.forEach(item => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');
            orderItem.classList.add('summary-item');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${item.name} x ${item.quantity}`;

            const priceSpan = document.createElement('span');
            priceSpan.textContent = `₹${(item.price * item.quantity).toFixed(2)}`;

            orderItem.appendChild(nameSpan);
            orderItem.appendChild(priceSpan);

            if (orderItems) {
                orderItems.appendChild(orderItem);
            }
            total += item.price * item.quantity;
        });
        if (totalPrice) {
            totalPrice.textContent = `₹${total.toFixed(2)}`;
        }
    }

    if (backToShopBtn) {
        backToShopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
});
