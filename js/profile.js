document.addEventListener('DOMContentLoaded', async () => {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const displayAddress = document.getElementById('displayAddress');
    const addressInput = document.getElementById('addressInput');
    const editAddressBtn = document.getElementById('editAddressBtn');
    const editAddressArea = document.getElementById('editAddressArea');
    const saveAddressBtn = document.getElementById('saveAddressBtn');
    const cancelAddressBtn = document.getElementById('cancelAddressBtn');
    const ordersContainer = document.getElementById('ordersContainer');
    const trackingContainer = document.getElementById('trackingContainer');

    const editDetailsBtn = document.getElementById('editDetailsBtn');
    const detailsDisplay = document.getElementById('detailsDisplay');
    const detailsEdit = document.getElementById('detailsEdit');
    const editNameInput = document.getElementById('editNameInput');
    const editEmailInput = document.getElementById('editEmailInput');
    const editPhoneInput = document.getElementById('editPhoneInput');
    const saveDetailsBtn = document.getElementById('saveDetailsBtn');
    const cancelDetailsBtn = document.getElementById('cancelDetailsBtn');
    const editPhoneError = document.getElementById('edit-phone-error');

    // 1. Check Authentication First
    try {
        // TODO: Check authentication via backend
        throw new Error("Backend authentication not implemented");
    } catch (e) {
        window.location.href = '/';
        return;
    }

    // 2. Fetch Profile Data
    async function loadProfile() {
        try {
            // TODO: Fetch profile data from backend
            throw new Error("Profile API not implemented");

            // Populate Account Details
            if (profileName) profileName.textContent = data.name || 'Not provided';
            if (profileEmail) profileEmail.textContent = data.email;
            if (profilePhone) profilePhone.textContent = data.phone || 'Not provided';
            if (displayAddress) displayAddress.textContent = data.address || 'No saved address';
            if (addressInput) addressInput.value = data.address || '';

            // Populate edit inputs
            if (editNameInput) editNameInput.value = data.name || '';
            if (editEmailInput) editEmailInput.value = data.email || '';
            if (editPhoneInput) editPhoneInput.value = data.phone || '';

            // Populate Orders & Tracking
            renderOrders(data.orders);
        } catch (error) {
            if (ordersContainer) ordersContainer.innerHTML = '<div class="empty-state">Failed to load profile details.</div>';
        }
    }

    function renderOrders(orders) {
        if (!orders || orders.length === 0) {
            if (ordersContainer) ordersContainer.innerHTML = '<div class="empty-state">No orders placed yet.</div>';
            if (trackingContainer) trackingContainer.innerHTML = '<div class="empty-state">No active shipments.</div>';
            return;
        }

        if (ordersContainer) ordersContainer.innerHTML = '';
        if (trackingContainer) trackingContainer.innerHTML = '';

        let trackingCount = 0;

        const ordersFragment = document.createDocumentFragment();
        const trackingFragment = document.createDocumentFragment();

        orders.forEach(order => {
            // Map items using global products array from products.js
            const itemsList = order.items.map(item => {
                const p = typeof products !== 'undefined' ? products.find(prod => prod.id === item.id) : null;
                const pName = p ? p.name : `Product #${item.id}`;
                return `${pName} (${item.selection}) x ${item.quantity}`;
            }).join(', ');

            // 1. Render in Order History
            const orderRow = document.createElement('div');
            orderRow.className = 'order-item-row';
            orderRow.innerHTML = `
                <div class="order-meta">
                    <span class="order-id">${order.order_id}</span>
                    <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                    <div class="order-items-list">${itemsList}</div>
                </div>
                <div class="order-price-status">
                    <span class="order-total">₹${order.total.toFixed(2)}</span>
                    <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
            `;
            ordersFragment.appendChild(orderRow);

            // 2. Render in Track Your Order if active/pending (e.g., Processing, Shipped)
            if (order.status === 'Processing' || order.status === 'Shipped') {
                trackingCount++;
                const trackRow = document.createElement('div');
                trackRow.className = 'order-item-row';
                trackRow.innerHTML = `
                    <div class="order-meta">
                        <span class="order-id">${order.order_id}</span>
                        <div class="order-items-list">${itemsList}</div>
                    </div>
                    <div class="order-price-status">
                        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                `;
                trackingFragment.appendChild(trackRow);
            }
        });

        if (ordersContainer) ordersContainer.appendChild(ordersFragment);
        if (trackingContainer && trackingCount > 0) trackingContainer.appendChild(trackingFragment);

        if (trackingCount === 0 && trackingContainer) {
            trackingContainer.innerHTML = '<div class="empty-state">No active or pending orders.</div>';
        }
    }

    // 3. Edit Address Flow
    if (editAddressBtn) {
        editAddressBtn.addEventListener('click', () => {
            editAddressBtn.style.display = 'none';
            if (editAddressArea) editAddressArea.style.display = 'block';
        });
    }

    if (cancelAddressBtn) {
        cancelAddressBtn.addEventListener('click', () => {
            if (editAddressArea) editAddressArea.style.display = 'none';
            if (editAddressBtn) editAddressBtn.style.display = 'inline-flex';
        });
    }

    if (saveAddressBtn) {
        saveAddressBtn.addEventListener('click', async () => {
            const newAddress = addressInput.value.strip ? addressInput.value.strip() : addressInput.value.trim();
            if (!newAddress) {
                alert('Address cannot be empty.');
                return;
            }

            saveAddressBtn.textContent = 'Saving...';
            saveAddressBtn.disabled = true;

            try {
                // TODO: Update address API call
                throw new Error("Address update API not implemented");
            } catch (e) {
                alert('Failed to update address. Please try again.');
            } finally {
                saveAddressBtn.textContent = 'Save';
                saveAddressBtn.disabled = false;
            }
        });
    }

    // 4. Edit Account Details Flow
    if (editDetailsBtn) {
        editDetailsBtn.addEventListener('click', () => {
            if (detailsDisplay) detailsDisplay.style.display = 'none';
            if (detailsEdit) detailsEdit.style.display = 'block';
        });
    }

    if (cancelDetailsBtn) {
        cancelDetailsBtn.addEventListener('click', () => {
            if (detailsEdit) detailsEdit.style.display = 'none';
            if (detailsDisplay) detailsDisplay.style.display = 'block';
            if (editPhoneError) editPhoneError.style.display = 'none';
        });
    }

    if (saveDetailsBtn) {
        saveDetailsBtn.addEventListener('click', async () => {
            const name = editNameInput.value.trim();
            const email = editEmailInput.value.trim();
            const phone = editPhoneInput.value.trim();

            // Strict client-side validation for phone
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                if (editPhoneError) editPhoneError.style.display = 'block';
                return;
            } else {
                if (editPhoneError) editPhoneError.style.display = 'none';
            }

            if (!name || !email) {
                alert('Name and Email cannot be empty.');
                return;
            }

            saveDetailsBtn.textContent = 'Saving...';
            saveDetailsBtn.disabled = true;

            try {
                // TODO: Update profile API call
                throw new Error("Profile update API not implemented");
            } catch (e) {
                    if (detailsEdit) detailsEdit.style.display = 'none';
                    if (detailsDisplay) detailsDisplay.style.display = 'block';
                } else {
                    const err = await response.json();
                    alert(`Error: ${err.detail || 'Failed to save changes'}`);
                }
            } catch (e) {
                alert('Failed to update details. Please try again.');
            } finally {
                saveDetailsBtn.textContent = 'Save Changes';
                saveDetailsBtn.disabled = false;
            }
        });
    }

    // Load initial profile data
    loadProfile();
});
