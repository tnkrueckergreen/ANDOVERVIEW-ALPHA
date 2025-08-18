import { getCombinedData } from '../api.js';
import { SortControl } from '../components/common/SortControl.js';
import { sortItems } from '../lib/sorting.js';
import { renderList } from '../lib/template.js';
import { SmallCard } from '../components/cards/SmallCard.js';

let articlesToDisplay = [];

function createHTML(title, articles) {
    const articleCards = renderList(articles, SmallCard);

    return `
        <section class="page article-grid-page">
            <div class="container">
                <div class="page-header"><h1>${title}</h1></div>
                ${SortControl()}
                <div id="article-grid-container" class="article-grid">${articleCards}</div>
            </div>
        </section>
    `;
}

function attachSortListener() {
    const sortSelect = document.getElementById('sort-by');
    const gridContainer = document.getElementById('article-grid-container');

    if (!sortSelect || !gridContainer) return;

    sortSelect.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        const sortedArticles = sortItems(articlesToDisplay, sortBy);
        gridContainer.innerHTML = renderList(sortedArticles, SmallCard);
    });
}

export async function render(container, filterValue = 'all', filterType = 'category') {
    const { articles } = await getCombinedData();
    let title = '';

    if (filterType === 'author') {
        const authorName = decodeURIComponent(filterValue);
        articlesToDisplay = articles.filter(article => 
            article.writers.some(writer => writer.name === authorName)
        );
        title = `Articles by ${authorName}`;
    } else { 
        const category = filterValue.toLowerCase();
        if (category === 'all') {
            articlesToDisplay = articles;
            title = 'All Articles';
        } else if (category === 'opinion') {
            // THE FIX: Check if 'opinion' or 'editorial' exists in the categories array.
            articlesToDisplay = articles.filter(a => 
                a.categories.some(c => ['opinion', 'editorial'].includes(c.toLowerCase()))
            );
            title = 'Opinion';
        } else {
            // THE FIX: Check if the category exists in the categories array.
            articlesToDisplay = articles.filter(a => 
                a.categories.map(c => c.toLowerCase()).includes(category)
            );
            title = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
        }
    }

    articlesToDisplay = sortItems(articlesToDisplay, 'date-desc');
    container.innerHTML = createHTML(title, articlesToDisplay);
    attachSortListener();
}