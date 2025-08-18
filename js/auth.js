// This module manages the global authentication state.

let currentUser = null;
let isLoggedIn = false;
let authChecked = false;

export async function login(username, password) { try { const response = await fetch('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }), }); const data = await response.json(); if (response.ok) { isLoggedIn = true; currentUser = data; updateAuthUI(); return { success: true, currentHash: location.hash }; } else { return { success: false, error: data.error }; } } catch (error) { return { success: false, error: 'Could not connect to the server.' }; } }
export async function signup(username, password) { try { const response = await fetch('/api/users/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }), }); const data = await response.json(); if (response.ok) { isLoggedIn = true; currentUser = data; updateAuthUI(); return { success: true, currentHash: location.hash }; } else { return { success: false, error: data.error }; } } catch (error) { return { success: false, error: 'Could not connect to the server.' }; } }

export async function checkLoginStatus() { if (authChecked) return; try { const response = await fetch('/api/users/status'); const data = await response.json(); if (data.loggedIn) { isLoggedIn = true; currentUser = data.user; } else { isLoggedIn = false; currentUser = null; } authChecked = true; updateAuthUI(); } catch (error) { console.error('Error checking login status:', error); isLoggedIn = false; currentUser = null; authChecked = true; } }

// Function to update the header UI
function updateAuthUI() {
    const authStatusContainer = document.getElementById('auth-status');
    const authBtnMobileContainer = document.getElementById('auth-btn-mobile');

    if (!authStatusContainer || !authBtnMobileContainer) return;

    if (isLoggedIn && currentUser) {
        authStatusContainer.innerHTML = `
            <button id="logout-btn" class="button-secondary">Log Out</button>
        `;
        authBtnMobileContainer.innerHTML = `<button id="logout-btn-mobile" class="button-secondary">Log Out</button>`;

        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        document.getElementById('logout-btn-mobile').addEventListener('click', handleLogout);

    } else {
        // --- MODIFIED: Simplified to only show the Sign Up button ---
        authStatusContainer.innerHTML = `
            <a href="#signup" class="button-secondary">Sign Up</a>
        `;
        authBtnMobileContainer.innerHTML = `<a href="#signup" class="button-secondary">Sign Up</a>`;
    }

    // REMOVED: The call to updateFooterCTA is gone from here.
}

async function handleLogout() { try { await fetch('/api/users/logout', { method: 'POST' }); isLoggedIn = false; currentUser = null; updateAuthUI(); location.reload(); } catch (error) { console.error('Logout failed:', error); } }

export function getCurrentUser() { return currentUser; }
export function getIsLoggedIn() { return isLoggedIn; }
