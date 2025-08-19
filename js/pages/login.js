import { login } from '../auth.js';
import { showError, showSuccess } from '../lib/toast.js';

function createHTML() {
    return `
        <section class="auth-page">
            <div class="auth-form-container">
                <h1>Log In</h1>
                <p class="subtitle">Don't have an account? <a href="#signup">Sign up</a></p>
                <form id="login-form" class="auth-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required autocomplete="current-password">
                    </div>
                    <button id="login-submit-btn" type="submit">Log In</button>
                </form>
            </div>
        </section>
    `;
}

function attachEventListeners() {
    const form = document.getElementById('login-form');
    const submitBtn = document.getElementById('login-submit-btn');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging In...';

        const username = form.username.value;
        const password = form.password.value;

        const result = await login(username, password);

        if (result.success) {
            showSuccess('Successfully logged in!');
            // Get the referring page from sessionStorage or stay on current page
            const returnTo = sessionStorage.getItem('returnToAfterAuth') || location.hash || '#';
            sessionStorage.removeItem('returnToAfterAuth');
            location.hash = returnTo;
        } else {
            showError(result.error || 'An unknown error occurred.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log In';
        }
    });
}

export function render(container) {
    container.innerHTML = createHTML();
    attachEventListeners();
}