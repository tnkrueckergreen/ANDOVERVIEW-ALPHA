/**
 * Show validation warning for form field
 * @param {HTMLElement} inputElement - Input element
 * @param {string} message - Warning message
 */
export function showWarning(inputElement, message) {
    const warning = document.querySelector(`[data-warning-for="${inputElement.id}"]`);
    if (warning) {
        warning.textContent = message || warning.dataset.defaultMessage;
        warning.style.display = 'block';
    }
    inputElement.classList.add('invalid');
}

/**
 * Clear all form warnings
 * @param {HTMLFormElement} form - Form element
 */
export function clearWarnings(form) {
    form.querySelectorAll('.warning-message').forEach(el => el.style.display = 'none');
    form.querySelectorAll('input, textarea').forEach(el => el.classList.remove('invalid'));
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
}

/**
 * Validate required field
 * @param {string} value - Field value
 * @returns {boolean} Is field filled
 */
export function isFieldFilled(value) {
    return value.trim().length > 0;
}