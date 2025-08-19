import { getCombinedData } from '../api.js';
import { FeaturedCard } from '../components/cards/FeaturedCard.js';
import { RecentCard } from '../components/cards/RecentCard.js';
import { renderList } from '../lib/template.js';

function populateTicker(articles) {
    const tickerList = document.getElementById('news-ticker-list');
    if (!tickerList) return;

    // Use the 8 most recent articles for the ticker
    const tickerArticles = articles.slice(0, 8);
    
    // Clear any existing content
    tickerList.innerHTML = '';

    // Create a "group" that will hold one set of ticker items
    const tickerGroup = document.createElement('div');
    tickerGroup.classList.add('ticker-group');

    // Populate the group with article links
    tickerArticles.forEach(article => {
        const link = document.createElement('a');
        link.href = `#single-article-page/${article.id}`;
        link.textContent = article.title;
        tickerGroup.appendChild(link);
    });

    // Create a second, identical group by cloning the first one
    const tickerGroupClone = tickerGroup.cloneNode(true);

    // Append both groups to the main list. This is the key to the seamless effect.
    tickerList.appendChild(tickerGroup);
    tickerList.appendChild(tickerGroupClone);
    
    // Force animation restart to fix frozen ticker on initial load
    // Remove animation temporarily
    tickerList.style.animation = 'none';
    
    // Trigger reflow to ensure the animation restarts
    void tickerList.offsetHeight;
    
    // Reapply animation after a minimal delay
    requestAnimationFrame(() => {
        tickerList.style.animation = '';
    });
}

function createHTML(featuredArticles, recentArticles) {
    const featuredCards = renderList(featuredArticles, FeaturedCard);
    const recentCards = renderList(recentArticles, RecentCard);

    return `
        <div class="page" id="home-page">
            <div class="container">
                <section class="welcome-section">
                    <h1>News, features, and perspectives from the students of Andover High.</h1>
                </section>
                <hr class="main-divider">
            </div>
            <main class="container content-grid">
                <div class="featured-column">
                    <h2 class="section-title">Featured</h2>
                    <div class="featured-articles-wrapper">${featuredCards}</div>
                </div>
                <div class="recent-column">
                    <h2 class="section-title">Recent</h2>
                    <div class="recent-grid">${recentCards}</div>
                </div>
            </main>
        </div>
    `;
}

export async function render(container) {
    const { articles } = await getCombinedData();
    const featuredArticles = articles.filter(a => a.display === 'featured').slice(0, 2);
    const recentArticles = articles.filter(a => a.display === 'recent').slice(0, 6);
    
    container.innerHTML = createHTML(featuredArticles, recentArticles);
    
    // Populate the news ticker with all articles sorted by date
    populateTicker(articles);
}