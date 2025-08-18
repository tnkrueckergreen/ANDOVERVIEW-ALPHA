/**
 * Simple template engine for rendering HTML components
 * @param {string} template - HTML template string with {{key}} placeholders
 * @param {Object} data - Data object to interpolate into template
 * @returns {string} Rendered HTML string
 */
export function render(template, data = {}) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : '';
    });
}

/**
 * Render a collection of items using a template
 * @param {Array} items - Array of data objects
 * @param {Function} templateFn - Function that returns template for each item
 * @returns {string} Concatenated HTML string
 */
export function renderList(items, templateFn) {
    return items.map(templateFn).join('');
}

/**
 * Conditionally render content
 * @param {boolean} condition - Condition to check
 * @param {string|Function} content - Content to render if true
 * @returns {string} Rendered content or empty string
 */
export function renderIf(condition, content) {
    if (!condition) return '';
    return typeof content === 'function' ? content() : content;
}