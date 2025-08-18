import { initRouter } from './router.js';
import { initModal } from './lib/modal.js';
import { initHeaderSearch } from './lib/headerSearch.js';
import { forceDownload } from './lib/forceDownload.js';
import { checkLoginStatus } from './auth.js';
import { subscribe, setEmail, listen as listenToSubscription } from './lib/subscriptionState.js'; // <-- ADDED BACK

// --- ADDED THIS FUNCTION BACK ---
function initFooterSubscriptionForm() {
    const formContainer = document.getElementById('footer-form-container');
    if (!formContainer) return;

    const subscribeForm = document.getElementById('subscribe-form-footer');
    const successMessage = document.getElementById('subscribe-success-message-footer');
    const emailInput = document.getElementById('subscribe-email-footer');

    listenToSubscription((state) => {
        if (emailInput.value !== state.email) {
            emailInput.value = state.email;
        }
        if (state.isSubscribed) {
            subscribeForm.classList.add('hidden');
            successMessage.classList.add('active');
        }
    });

    emailInput.addEventListener('input', (e) => {
        setEmail(e.target.value);
    });

    subscribeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (emailInput.value && emailInput.checkValidity()) {
            subscribe();
        }
    });
}
// ------------------------------

function initMobileNavAccordion() {
    const nav = document.querySelector('.main-nav');
    const mainHeader = document.querySelector('.main-header');
    if (!nav || !mainHeader) return;

    nav.addEventListener('click', (e) => {
        const mobileToggle = document.querySelector('.mobile-toggle');
        if (getComputedStyle(mobileToggle).display === 'none') return;
        if (e.target.matches('.submenu-toggle')) {
            e.preventDefault();
            const dropdown = e.target.closest('.dropdown');
            if (dropdown) {
                const isOpen = dropdown.classList.toggle('is-open');
                e.target.textContent = isOpen ? '−' : '+';
                e.target.setAttribute('aria-expanded', isOpen);
            }
        } else if (e.target.closest('a')) {
            mainHeader.classList.remove('nav-open');
            nav.querySelectorAll('.dropdown.is-open').forEach(d => {
                d.classList.remove('is-open');
                const toggle = d.querySelector('.submenu-toggle');
                if (toggle) {
                    toggle.textContent = '+';
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });
}

function initCardTouchEvents() {
    let activeCard = null;
    const options = { passive: true };
    document.body.addEventListener('touchstart', (e) => {
        const card = e.target.closest('.article-card-linkable');
        if (card) { activeCard = card; activeCard.classList.add('card-is-active'); }
    }, options);
    const endTouch = () => { if (activeCard) { activeCard.classList.remove('card-is-active'); activeCard = null; } };
    document.body.addEventListener('touchend', endTouch);
    document.body.addEventListener('touchcancel', endTouch);
}

function initGlobalEventListeners(closeModal, closeSearch) {
    document.body.addEventListener('click', async (e) => {
        const downloadBtn = e.target.closest('.download-btn');
        if (downloadBtn) {
            e.preventDefault(); if (downloadBtn.disabled) return;
            const url = downloadBtn.dataset.url; const filename = downloadBtn.dataset.filename; const originalText = downloadBtn.textContent;
            downloadBtn.textContent = 'Downloading...'; downloadBtn.disabled = true;
            try { await forceDownload(url, filename); } catch (error) { console.error("Download failed:", error.message); } finally { downloadBtn.textContent = originalText; downloadBtn.disabled = false; }
            return;
        }
        const copyBtn = e.target.closest('.copy-link-btn');
        if (copyBtn) {
            e.preventDefault();
            navigator.clipboard.writeText(window.location.href).then(() => {
                copyBtn.classList.add('is-copied');
                setTimeout(() => { copyBtn.classList.remove('is-copied'); }, 2000);
            }).catch(err => { console.error('Failed to copy link: ', err); alert('Failed to copy link.'); });
            return;
        }
        const card = e.target.closest('.article-card-linkable');
        if (card) {
            if (window.getSelection().toString().length > 0) return;
            if (e.target.closest('a')) return;
            const mainLink = card.querySelector('.main-article-link');
            if (mainLink) location.hash = mainLink.hash;
        }
    });
    const mainHeader = document.querySelector('.main-header');
    const mobileToggle = document.querySelector('.mobile-toggle');
    mobileToggle.addEventListener('click', () => mainHeader.classList.toggle('nav-open'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeSearch(); } });
}

async function init() {
    await checkLoginStatus();
    const closeModal = initModal();
    const closeSearch = initHeaderSearch();

    initFooterSubscriptionForm(); // <-- ADDED BACK

    initGlobalEventListeners(closeModal, closeSearch);
    initMobileNavAccordion();
    initCardTouchEvents();
    initRouter();
}

document.addEventListener('DOMContentLoaded', init);