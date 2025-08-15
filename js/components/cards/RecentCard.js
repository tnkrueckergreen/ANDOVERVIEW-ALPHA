import { ArticleCard } from './ArticleCard.js';

/**
 * Recent article card component for homepage
 * @param {Object} article - Article data object
 * @returns {string} HTML string for recent card
 */
export function RecentCard(article) {
    return ArticleCard(article, {
        className: 'recent-card',
        titleTag: 'h4',
        titleClass: 'article-title-small',
        showExcerpt: true,
        showAuthors: true,
        imageLoading: 'lazy'
    });
}