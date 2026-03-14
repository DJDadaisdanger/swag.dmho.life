document.addEventListener('DOMContentLoaded', () => {
    const orderItems = document.getElementById('order-items');
    const totalPrice = document.getElementById('total-price');
    const backToShopBtn = document.getElementById('back-to-shop');

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        orderItems.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        let total = 0;
        cart.forEach(item => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');
            orderItem.innerHTML = `
                <span>${item.name} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            orderItems.appendChild(orderItem);
            total += item.price * item.quantity;
        });
        totalPrice.textContent = `$${total.toFixed(2)}`;
    }

    backToShopBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
