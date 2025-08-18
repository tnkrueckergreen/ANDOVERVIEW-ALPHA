import { formatAuthorNamesSummary, formatAuthorNamesFull } from '../../lib/formatters.js';

/**
 * A dedicated component for rendering the avatar stack.
 * @param {Array} writers - A pre-sorted array of writer objects.
 * @param {Object} options - Display options { size, compact }.
 * @returns {string} HTML string for the avatar stack.
 */
export function AvatarStack(writers, { size = 'large', compact = false } = {}) {
    // MODIFIED: Check if there are any writers at all.
    if (!writers || writers.length === 0) {
        return '';
    }

    // REMOVED: The filter for `isCurrentStaff` is gone. All authors will now be considered for an avatar.
    const writersWithAvatars = writers;

    // 1. Determine which avatars to actually show.
    let visibleAvatars;
    if (compact) {
        // In compact mode (homepage), limit to 2 avatars.
        const maxVisible = 2;
        visibleAvatars = writersWithAvatars.slice(0, maxVisible);
    } else {
        // In full mode (article page), show all authors.
        visibleAvatars = writersWithAvatars;
    }

    // 2. Generate the <img> tags for the visible authors.
    const avatars = visibleAvatars.map(writer => 
        `<img src="${writer.image}" alt="${writer.name}" title="${writer.name}">`
    ).join('');

    // 3. Calculate the "+N" count. This is always the total number of authors
    //    minus the number of avatars we are actually showing.
    const remainingCount = writers.length - visibleAvatars.length;

    const moreAvatar = remainingCount > 0 
        ? `<div class="avatar-more">+${remainingCount}</div>` 
        : '';

    return `
        <div class="avatar-stack ${size}">
            ${avatars}
            ${moreAvatar}
        </div>
    `;
}

/**
 * A dedicated component for rendering just the formatted author names.
 * @param {Array} writers - A pre-sorted array of writer objects.
 * @param {Object} options - Display options.
 * @returns {string} The formatted names string (e.g., "By Name and Name").
 */
export function AuthorNames(writers, { fullNames = false } = {}) {
    const formattedNames = fullNames 
        ? formatAuthorNamesFull(writers) 
        : formatAuthorNamesSummary(writers);

    if (!formattedNames) {
        return '';
    }

    return `By ${formattedNames}`;
}

/**
 * The main component, a wrapper for homepage cards.
 * It combines the AvatarStack and AuthorNames components.
 * @param {Array} writers - Array of writer objects.
 * @param {Object} options - Display options.
 * @returns {string} HTML string for the complete author meta block.
 */
export function Authors(writers, options = {}) {
    if (!writers || writers.length === 0) {
        return '';
    }

    const {
        size = 'large',
        fullNames = false,
        className = 'author-meta'
    } = options;

    const stack = AvatarStack(writers, { size, compact: true });
    const names = AuthorNames(writers, { fullNames });

    const namesSpan = names ? `<span>${names}</span>` : '';

    return `
        <div class="${className} ${size}">
            ${stack}
            ${namesSpan}
        </div>
    `;
}