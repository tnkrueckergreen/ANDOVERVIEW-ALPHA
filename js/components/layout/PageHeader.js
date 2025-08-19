/**
 * Page header component with optional subtitle
 * @param {string} title - Main page title
 * @param {string} subtitle - Optional subtitle
 * @returns {string} HTML string for page header
 */
export function PageHeader(title, subtitle = '') {
    return `
        <div class="page-header">
            <h1>${title}</h1>
            ${subtitle ? `<p>${subtitle}</p>` : ''}
        </div>
    `;
}