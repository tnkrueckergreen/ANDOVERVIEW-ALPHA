/**
 * Sorts an array of items based on a specified key and direction.
 * @param {Array<Object>} items The array of articles to sort.
 * @param {string} sortBy The sorting key (e.g., 'date-desc', 'title-asc').
 * @returns {Array<Object>} A new, sorted array.
 */
export function sortItems(items, sortBy) {
    // Create a new array to avoid mutating the original
    const sortedItems = [...items];

    switch (sortBy) {
        case 'date-desc':
            sortedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            sortedItems.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'title-asc':
            sortedItems.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sortedItems.sort((a, b) => b.title.localeCompare(a.title));
            break;
        default:
            // Default to newest first if the key is unknown
            sortedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
    }

    return sortedItems;
}