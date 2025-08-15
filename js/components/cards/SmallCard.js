import { ArticleCard } from './ArticleCard.js';

/**
 * Small article card component for lists and search results
 * @param {Object} article - Article data object
 * @returns {string} HTML string for small card
 */
export function SmallCard(article) {
    return ArticleCard(article, {
        className: 'article-card-small',
        titleTag: 'h4',
        titleClass: 'article-title-small',
        showExcerpt: true,
        showAuthors: true,
        imageLoading: 'lazy'
    });
}