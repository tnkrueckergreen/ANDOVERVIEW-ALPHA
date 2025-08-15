import Fuse from 'fuse.js';
import { getCombinedData } from '../api.js';

let fuseInstance = null;
let articlesForSearch = [];

/**
 * Strip HTML tags from content
 * @param {string} html - HTML content
 * @returns {string} Plain text content
 */
function stripHtml(html) {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

/**
 * Initialize search with Fuse.js
 */
export async function initializeSearch() {
    if (fuseInstance) return;

    const { articles } = await getCombinedData();

    // MODIFIED: Create a comprehensive search index for each article.
    articlesForSearch = articles.map(article => {
        const searchableContent = [];

        // Add core article data
        searchableContent.push(article.title);
        searchableContent.push(article.rawDescription); // Use the raw description
        searchableContent.push(stripHtml(article.content));

        // Add tags and categories
        if (article.tags) searchableContent.push(article.tags.join(' '));
        if (article.categories) searchableContent.push(article.categories.join(' '));

        // Add all author data (name, role, bio)
        if (article.writers) {
            article.writers.forEach(writer => {
                searchableContent.push(writer.name);
                if (writer.role) searchableContent.push(writer.role);
                if (writer.bio) searchableContent.push(writer.bio);
            });
        }

        return {
            ...article,
            // Join all content into a single, searchable string
            searchableText: searchableContent.join(' | ')
        };
    });

    // MODIFIED: Simplified and re-weighted keys for the new comprehensive search index.
    const options = {
        keys: [
            { name: 'title', weight: 0.6 },          // Title matches are most important.
            { name: 'searchableText', weight: 0.4 }  // Everything else has a strong, combined weight.
        ],
        includeScore: true,
        minMatchCharLength: 2,
        threshold: 0.35, // Slightly increased threshold for broader matching
        ignoreLocation: true,
    };

    fuseInstance = new Fuse(articlesForSearch, options);
}

/**
 * Perform search with query
 * @param {string} query - Search query
 * @returns {Array} Search results
 */
export async function performSearch(query) {
    await initializeSearch();
    const results = fuseInstance.search(query);
    return results.map(result => result.item);
}