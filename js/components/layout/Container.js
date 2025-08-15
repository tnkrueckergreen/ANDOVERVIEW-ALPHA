/**
 * Container wrapper component
 * @param {string} content - Inner HTML content
 * @param {string} className - Additional CSS classes
 * @returns {string} HTML string for container
 */
export function Container(content, className = '') {
    return `
        <div class="container ${className}">
            ${content}
        </div>
    `;
}