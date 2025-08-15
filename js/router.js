import { render as renderHome } from './pages/home.js';
import { render as renderAbout } from './pages/about.js';
import { render as renderArticleList } from './pages/articleList.js';
import { render as renderSingleArticle } from './pages/singleArticle.js';
import { render as renderIssues } from './pages/issues.js';
import { render as renderSearchResults } from './pages/searchResults.js';
import { render as renderSubscribe } from './pages/subscribe.js';
import { render as renderContact } from './pages/contact.js';
import { render as renderWriteForUs } from './pages/writeForUs.js';
import { render as renderLogin } from './pages/login.js';
import { render as renderSignup } from './pages/signup.js';

const mainContent = document.getElementById('main-content');
const footerCTA = document.getElementById('footer-cta');
const newsTicker = document.getElementById('news-ticker-container');

const routes = {
    'home-page': () => renderHome(mainContent),
    'about-page': () => renderAbout(mainContent),
    'contact': () => renderContact(mainContent),
    'write-for-us': () => renderWriteForUs(mainContent),
    'articles-page-all': () => renderArticleList(mainContent, 'all', 'category'),
    'articles-page-community': () => renderArticleList(mainContent, 'community', 'category'),
    'articles-page-sports': () => renderArticleList(mainContent, 'sports', 'category'),
    'articles-page-arts': () => renderArticleList(mainContent, 'arts', 'category'),
    'articles-page-reviews': () => renderArticleList(mainContent, 'reviews', 'category'),
    'articles-page-opinion': () => renderArticleList(mainContent, 'opinion', 'category'),
    'articles-page-editorial': () => renderArticleList(mainContent, 'editorial', 'category'),
    'issues-page': () => renderIssues(mainContent),
    'subscribe': () => renderSubscribe(mainContent),
    'login': () => renderLogin(mainContent),
    'signup': () => renderSignup(mainContent),
    'search': (param) => renderSearchResults(mainContent, param),
    'single-article-page': (param) => renderSingleArticle(mainContent, param),
    'author': (param) => renderArticleList(mainContent, param, 'author'),
};

function getRouteAndParams(hash) {
    const pathString = hash.substring(1);
    const [path, ...params] = pathString.split('/');
    const param = params.join('/');
    return { path: path || 'home-page', param };
}

function updateActiveNavLink(path) {
    const navLinks = document.querySelectorAll('.main-nav a.nav-link');
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').substring(1);
        let isActive = (linkPath === path);
        if (path === 'home-page' && linkPath === '') isActive = true;
        if (path === 'articles-page-editorial' && linkPath === 'articles-page-opinion') isActive = true;
        if (path === 'articles-page-reviews' && linkPath === 'articles-page-arts') isActive = true;
        if ((path === 'contact' || path === 'write-for-us') && linkPath === 'about-page') isActive = true;
        link.classList.toggle('active-link', isActive);
    });
}

export async function handleRouteChange() {
    const { path, param } = getRouteAndParams(location.hash);

    if (footerCTA) {
        const pagesToHideFooterOn = ['subscribe', 'login', 'signup', 'contact'];
        footerCTA.classList.toggle('hidden', pagesToHideFooterOn.includes(path));
    }

    if (newsTicker) {
        newsTicker.style.display = (path === 'home-page') ? 'flex' : 'none';
    }

    const renderFunction = routes[path];

    if (renderFunction) {
        await renderFunction(param);
    } else {
        location.hash = '#';
        return;
    }

    updateActiveNavLink(path);
    window.scrollTo(0, 0);
}

export function initRouter() {
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();
}