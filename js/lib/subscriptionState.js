// A central state manager for the subscription process.
// It tracks both the email value and the final subscribed status.

import { showConfetti } from './effects.js'; // <-- ADDED: Import the confetti effect

const state = {
    email: '',
    isSubscribed: false
};

const listeners = new Set();

function notifyListeners() {
    listeners.forEach(listener => listener(state));
}

/**
 * Updates the email in the central state. Called on every keystroke.
 * @param {string} newEmail The new value from the input field.
 */
export function setEmail(newEmail) {
    if (state.email !== newEmail) {
        state.email = newEmail;
        notifyListeners();
    }
}

/**
 * Finalizes the subscription. Called on form submission.
 */
export function subscribe() {
    if (!state.isSubscribed) {
        state.isSubscribed = true;
        // In a real app, you might save this to localStorage here.
        notifyListeners();
        showConfetti(); // <-- ADDED: Trigger the celebration!
    }
}

/**
 * Allows a component to listen for any changes to the subscription state.
 * @param {function} callback The function to call when state changes.
 */
export function listen(callback) {
    listeners.add(callback);
    // Immediately call the callback with the current state when a new listener is added.
    callback(state);
}