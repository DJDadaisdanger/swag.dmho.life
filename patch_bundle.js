const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// The bundle click listener:
// It has:
/*
                addToCart(id1, getSelection(product1), 1);
                addToCart(id2, getSelection(product2), 1);

                cartSidebar.classList.add('open');
                sidebarOverlay.classList.add('active');
*/

// Let's modify app.js slightly to handle addToCart properly.
// In patch_app.js.js I replaced addToCart with an async prompt wrapper,
// so two calls to addToCart back-to-back will spawn two modals if it's the first time.
// Let's refactor the prompt wrapper slightly.

// Find the showLoginPrompt and make it queue or only show one.
// Let's make showLoginPrompt check if a modal is already open.
let replacePrompt = `function showLoginPrompt(onLogin, onNvm) {
        if (isLoggedIn || hasSeenLoginPrompt) {
            onNvm();
            return;
        }

        if (document.getElementById('loginPromptModal')) {
            // Modal already exists, just attach to it or wait.
            // Since we're executing back to back, the easiest is to set a global pending action queue.
            window.pendingLoginActions = window.pendingLoginActions || [];
            window.pendingLoginActions.push(onNvm); // For NVM
            window.pendingLoginActionsLogin = window.pendingLoginActionsLogin || [];
            window.pendingLoginActionsLogin.push(onLogin);
            return;
        }

        window.pendingLoginActions = [onNvm];
        window.pendingLoginActionsLogin = [onLogin];

        const modalHtml = \\\`
            <div class="modal open" id="loginPromptModal" style="z-index: 5000;">
                <div class="modal-content" style="max-width: 400px; text-align: center; padding: 2rem;">
                    <h2 style="margin-bottom: 1rem;">Save Your Progress</h2>
                    <p style="margin-bottom: 2rem; color: #888;">You must login to save your wishlist and cart securely.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="nvmBtn" style="background: #1a1a1a; color: #eeeeee; border: 1px solid #2a2a2a; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Nvm</button>
                        <button id="loginBtn" style="background: #3b82f6; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Login</button>
                    </div>
                </div>
            </div>
        \\\`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('loginPromptModal');

        document.getElementById('nvmBtn').addEventListener('click', () => {
            modal.remove();
            hasSeenLoginPrompt = true;
            localStorage.setItem('hasSeenLoginPrompt', 'true');
            window.pendingLoginActions.forEach(action => action());
            window.pendingLoginActions = [];
            window.pendingLoginActionsLogin = [];
        });

        document.getElementById('loginBtn').addEventListener('click', () => {
            modal.remove();
            isLoggedIn = true;
            hasSeenLoginPrompt = true;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('hasSeenLoginPrompt', 'true');
            window.pendingLoginActionsLogin.forEach(action => action());
            window.pendingLoginActions = [];
            window.pendingLoginActionsLogin = [];
        });
    }`;

content = content.replace(/function showLoginPrompt\(onLogin, onNvm\) \{[\s\S]*?function saveState\(\)/m, replacePrompt + "\n\n    function saveState()");

fs.writeFileSync('app.js', content);
