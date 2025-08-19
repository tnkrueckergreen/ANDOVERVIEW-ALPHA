import { signup } from '../auth.js';
import { showError, showSuccess } from '../lib/toast.js';

function createHTML() {
    return `
        <section class="auth-page">
            <div class="auth-form-container">
                <h1>Create Account</h1>
                <p class="subtitle">Already have an account? <a href="#login">Log in</a></p>
                <form id="signup-form" class="auth-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="password">Password (min. 6 characters)</label>
                        <input type="password" id="password" name="password" required minlength="6" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" name="confirm-password" required minlength="6" autocomplete="new-password">
                    </div>
                    <button id="signup-submit-btn" type="submit">Sign Up</button>
                </form>
            </div>
        </section>
    `;
}

function attachEventListeners() {
    const form = document.getElementById('signup-form');
    const submitBtn = document.getElementById('signup-submit-btn');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing Up...';

        const username = form.username.value;
        const password = form.password.value;
        const confirmPassword = form['confirm-password'].value;

        // Validate passwords match
        if (password !== confirmPassword) {
            showError('Passwords do not match.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
            return;
        }

        const result = await signup(username, password);

        if (result.success) {
            showSuccess('Account created successfully!');
            // Get the referring page from sessionStorage or stay on current page
            const returnTo = sessionStorage.getItem('returnToAfterAuth') || location.hash || '#';
            sessionStorage.removeItem('returnToAfterAuth');
            location.hash = returnTo;
        } else {
            showError(result.error || 'An unknown error occurred.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    });
}

export function render(container) {
    container.innerHTML = createHTML();
    attachEventListeners();
}