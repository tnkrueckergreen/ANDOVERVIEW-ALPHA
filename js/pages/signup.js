import { signup } from '../auth.js';

function createHTML() {
    return `
        <section class="auth-page">
            <div class="auth-form-container">
                <h1>Create Account</h1>
                <p class="subtitle">Already have an account? <a href="#login">Log in</a></p>
                <div id="error-message" class="error-message"></div>
                <form id="signup-form" class="auth-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="password">Password (min. 6 characters)</label>
                        <input type="password" id="password" name="password" required minlength="6" autocomplete="new-password">
                    </div>
                    <button id="signup-submit-btn" type="submit">Sign Up</button>
                </form>
            </div>
        </section>
    `;
}

function attachEventListeners() {
    const form = document.getElementById('signup-form');
    const errorMessageDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('signup-submit-btn');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessageDiv.style.display = 'none';

        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing Up...';

        const username = form.username.value;
        const password = form.password.value;

        const result = await signup(username, password);

        if (result.success) {
            // Get the referring page from sessionStorage or stay on current page
            const returnTo = sessionStorage.getItem('returnToAfterAuth') || location.hash || '#';
            sessionStorage.removeItem('returnToAfterAuth');
            location.hash = returnTo;
        } else {
            errorMessageDiv.textContent = result.error || 'An unknown error occurred.';
            errorMessageDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    });
}

export function render(container) {
    container.innerHTML = createHTML();
    attachEventListeners();
}