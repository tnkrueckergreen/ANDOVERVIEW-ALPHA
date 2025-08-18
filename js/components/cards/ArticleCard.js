import { Authors } from '../metadata/Authors.js';

/**
 * Base article card component
 * @param {Object} article - Article data object
 * @param {Object} options - Display options
 * @returns {string} HTML string for article card
 */
export function ArticleCard(article, options = {}) {
    const {
        className = 'article-card',
        titleTag = 'h4',
        titleClass = 'article-title',
        showExcerpt = true,
        showAuthors = true,
        imageLoading = 'lazy',
        authorSize = 'large',
        withAvatars = true
    } = options;

    return `
        <article class="${className} article-card-linkable">
            ${renderImage(article, imageLoading)}
            ${renderMetaBar(article)}
            ${renderTitle(article, titleTag, titleClass)}
            ${showExcerpt ? renderExcerpt(article) : ''}
            ${showAuthors ? Authors(article.writers, { 
                size: authorSize, 
                withAvatars,
                className: 'author-meta'
            }) : ''}
        </article>
    `;
}

function renderImage(article, loading) {
    // MODIFIED: Use a placeholder if article.image is missing and provide better alt text.
    const imageSrc = article.image ? article.image : 'assets/icons/placeholder-image.png';
    const altText = article.image ? article.title : 'Placeholder image for article';
    return `<img src="${imageSrc}" alt="${altText}" loading="${loading}">`;
}

function renderMetaBar(article) {
    return `
        <div class="meta-bar">
            <span class="category">${article.category}</span>
            <span class="date">${article.date}</span>
        </div>
    `;
}

function renderTitle(article, tag, className) {
    return `
        <a href="#single-article-page/${article.id}" class="main-article-link">
            <${tag} class="${className}">${article.title}</${tag}>
        </a>
    `;
}

function renderExcerpt(article) {
    // The description is now pre-formatted HTML from the API
    return `<p class="excerpt">${article.description}</p>`;
}