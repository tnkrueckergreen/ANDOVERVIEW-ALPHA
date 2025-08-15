import { ArticleCard } from './ArticleCard.js';

/**
 * Featured article card component for homepage
 * @param {Object} article - Article data object
 * @returns {string} HTML string for featured card
 */
export function FeaturedCard(article) {
    return ArticleCard(article, {
        className: 'featured-card',
        titleTag: 'h3',
        titleClass: 'article-title-large',
        showExcerpt: true,
        showAuthors: true,
        imageLoading: 'eager'
    });
}