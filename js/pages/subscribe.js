import { subscribe, setEmail, listen as listenToSubscription } from '../lib/subscriptionState.js';

function createHTML() {
    return `
        <section class="page subscribe-page">
            <div class="container">
                <div class="subscribe-content">
                    <h1>Join the ANDOVERVIEW community.</h1>
                    <p>Get the latest stories, features, and updates from our student journalists, sent straight to your inbox.</p>
                    
                    <div id="form-container-page" class="form-container">
                        <form id="subscribe-form-page">
                            <input type="email" id="subscribe-email-page" placeholder="Enter your email address" required>
                            <button type="submit" class="button-subscribe">Subscribe</button>
                        </form>
                        <div id="subscribe-success-message-page" class="subscribe-success">
                            <span>Thank you for subscribing!</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function attachEventListeners() {
    const formContainer = document.getElementById('form-container-page');
    if (!formContainer) return;

    const subscribeForm = document.getElementById('subscribe-form-page');
    const successMessage = document.getElementById('subscribe-success-message-page');
    const emailInput = document.getElementById('subscribe-email-page');

    // Listen to central state changes to update this form's UI
    listenToSubscription((state) => {
        // Sync the input value
        if (emailInput.value !== state.email) {
            emailInput.value = state.email;
        }
        // Show success message if subscribed
        if (state.isSubscribed) {
            subscribeForm.classList.add('hidden');
            successMessage.classList.add('active');
        }
    });

    // Send this form's input changes to the central state
    emailInput.addEventListener('input', (e) => {
        setEmail(e.target.value);
    });

    // Handle this form's submission
    subscribeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (emailInput.value && emailInput.checkValidity()) {
            subscribe(); // Update the central state
        }
    });
}

export function render(container) {
    container.innerHTML = createHTML();
    attachEventListeners();
}