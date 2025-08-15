import { getCombinedData, likeArticle, getComments, postComment } from '../api.js';
import { SocialShare } from '../components/common/SocialShare.js';
import { AvatarStack } from '../components/metadata/Authors.js';
import { getIsLoggedIn, getCurrentUser } from '../auth.js';

function formatTimeAgo(dateString) {
    const date = new Date(dateString.replace(' ', 'T') + 'Z');
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
}

function createAuthorLineHTML(writers) { if (!writers || writers.length === 0) return ''; const irregularPlurals = { 'Editor-in-Chief': 'Editors-in-Chief' }; const irregularSingulars = Object.fromEntries(Object.entries(irregularPlurals).map(([s, p]) => [p, s])); function normalizeRole(role, count) { if (!role) return ''; if (count === 1) { if (irregularSingulars[role]) return irregularSingulars[role]; if (role.endsWith('s') && !role.endsWith('ss') && !['arts', 'sports'].includes(role.toLowerCase())) { return role.slice(0, -1); } return role; } else { if (irregularPlurals[role]) return irregularPlurals[role]; if (!role.endsWith('s')) return `${role}s`; return role; } } const formatNames = (writers) => { const linkedNames = writers.map(w => `<a href="${w.authorLink || `#author/${encodeURIComponent(w.name)}`}" class="author-link">${w.name}</a>`); if (linkedNames.length === 1) return linkedNames[0]; if (linkedNames.length === 2) return linkedNames.join(' and '); return `${linkedNames.slice(0, -1).join(', ')}, and ${linkedNames.slice(-1)}`; }; const grouped = writers.reduce((acc, writer) => { const baseRole = normalizeRole(writer.role || '_noRole', 1); const isFormer = !writer.isCurrentStaff; const key = `${baseRole}_${isFormer}`; if (!acc[key]) acc[key] = []; acc[key].push(writer); return acc; }, {}); const parts = Object.entries(grouped).map(([key, group]) => { const [baseRole, isFormerStr] = key.split('_'); const isFormer = isFormerStr === 'true'; const names = formatNames(group); if (baseRole === '_noRole') return names; let displayRole = normalizeRole(baseRole, group.length); if (isFormer) displayRole = `Former ${displayRole}`; return `${names} • <span class="author-role">${displayRole}</span>`; }); let final; if (parts.length === 1) final = parts[0]; else if (parts.length === 2) final = parts.join(' and '); else final = `${parts.slice(0, -1).join(', ')}, and ${parts.slice(-1)}`; return `By ${final}`; }
function createInlineImageFigure(image) { const hasCaption = image.caption || image.credit; const placementClass = `placement--${image.placement.toLowerCase().replace(/\s+/g, '-')}`; let figureHTML = `<figure class="single-article-figure ${placementClass}"><img src="${image.file}" alt="${image.caption || 'Article image'}" class="single-article-image">`; if (hasCaption) { figureHTML += `<figcaption>${image.caption ? `<span class="caption-text">${image.caption}</span>` : ''}${image.credit ? `<span class="caption-credit">${image.credit}</span>` : ''}</figcaption>`; } figureHTML += `</figure>`; return figureHTML; }
function injectImagesIntoContent(content, images) { if (!images || images.length === 0) return { mainContent: content, bottomContent: '' }; const tempDiv = document.createElement('div'); tempDiv.innerHTML = content; let contentElements = Array.from(tempDiv.children); const topImages = images.filter(img => img.placement.startsWith('Top')); const bottomBlockImages = images.filter(img => img.placement === 'Bottom Center'); const bodyImages = images.filter(img => !img.placement.startsWith('Top') && img.placement !== 'Bottom Center'); const blockElementIndices = contentElements.map((el, i) => (['P', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'BLOCKQUOTE'].includes(el.tagName) ? i : -1)).filter(i => i !== -1); if (bodyImages.length > 0) { if (blockElementIndices.length > 0) { const interval = Math.max(1, Math.floor(blockElementIndices.length / (bodyImages.length + 1))); for (let i = bodyImages.length - 1; i >= 0; i--) { const targetBlockNumber = (i + 1) * interval; const cappedTargetBlock = Math.min(targetBlockNumber, blockElementIndices.length); const insertionPointIndex = blockElementIndices[cappedTargetBlock - 1] + 1; const figureHtml = createInlineImageFigure(bodyImages[i]); const figureWrapper = document.createElement('div'); figureWrapper.innerHTML = figureHtml.trim(); if (figureWrapper.firstChild) contentElements.splice(insertionPointIndex, 0, figureWrapper.firstChild); } } else { const unplacedFigures = bodyImages.map(createInlineImageFigure); const figuresWrapper = document.createElement('div'); figuresWrapper.innerHTML = unplacedFigures.join(''); contentElements.push(...Array.from(figuresWrapper.children)); } } const topImagesHTML = topImages.map(createInlineImageFigure).join(''); const mainContentHTML = topImagesHTML + contentElements.map(el => el.outerHTML).join(''); const bottomContentHTML = bottomBlockImages.map(createInlineImageFigure).join(''); return { mainContent: mainContentHTML, bottomContent: bottomContentHTML }; }

function Comment(comment) {
    const initial = comment.author_name ? comment.author_name.charAt(0) : 'A';
    return `<li class="comment" id="comment-${comment.comment_id}"><div class="comment-avatar">${initial}</div><div class="comment-body"><div class="comment-header"><span class="comment-author">${comment.author_name}</span><span class="comment-timestamp">${formatTimeAgo(comment.timestamp)}</span></div><div class="comment-content">${comment.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div></li>`;
}

function CommentSection(articleId) {
    const isLoggedIn = getIsLoggedIn();
    const currentUser = getCurrentUser();

    if (isLoggedIn && currentUser) {
        return `
            <section class="comments-section">
                <h3>Leave a Comment</h3>
                <form class="comment-form" id="comment-form" data-article-id="${articleId}">
                    <textarea id="comment-content" placeholder="Write a comment as ${currentUser.username}..." required maxlength="500"></textarea>
                    <div class="comment-form-actions">
                        <span class="char-counter" id="char-counter">500</span>
                        <button type="submit" id="comment-submit-btn" disabled>Post Comment</button>
                    </div>
                </form>
                <ul id="comment-list"></ul>
            </section>
        `;
    } 

    return `
        <section class="comments-section">
            <h3>Comments</h3>
            <div class="login-prompt-for-comments">
                <p><a href="#login">Log in</a> or <a href="#signup">sign up</a> to leave a comment.</p>
            </div>
            <ul id="comment-list"></ul>
        </section>
    `;
}

function createHTML(article) {
    const { writers, tags, category, date, title, description, content, images, id } = article;
    const tagListHTML = (tags && tags.length > 0) ? `<div class="tag-list">${tags.map(tag => `<a href="#search/${encodeURIComponent(tag)}" class="tag-item">${tag}</a>`).join('')}</div>` : '';
    const authorMetaTopHTML = (writers && writers.length > 0) ? `<div class="single-article-meta-top">${AvatarStack(writers, { compact: false })}<span class="author-byline">${createAuthorLineHTML(writers)}</span></div>` : '';
    let authorBiosContainer = '';
    const currentStaffForBio = writers.filter(w => w.isCurrentStaff && w.bio);
    if (currentStaffForBio.length > 0) {
        const authorProfilesHTML = currentStaffForBio.map(writer => `<div class="author-profile"><img src="${writer.image}" alt="${writer.name}"><div><h4>About ${writer.name}</h4><p>${writer.bio}</p></div></div>`).join('<hr class="author-separator">');
        authorBiosContainer = `<div class="author-bios-container">${authorProfilesHTML}</div>`;
    }
    const { mainContent, bottomContent } = injectImagesIntoContent(content, images);
    const likedClass = article.hasLiked ? 'liked' : '';
    return `
        <section class="page" id="single-article-page">
            <div class="container">
                <div class="single-article-wrapper">
                    <div class="article-meta-bar"><span class="category">${category}</span><span class="date">${date}</span></div>
                    <header class="single-article-header">
                        <h1>${title}</h1>
                        <p class="single-article-description">${description}</p>
                        <div class="article-interactions">
                            <button class="like-btn ${likedClass}" data-article-id="${id}">👍 <span class="like-count">${article.likes}</span> Likes</button>
                        </div>
                        ${SocialShare(article, { variant: 'minimal' })}
                    </header>
                    ${tagListHTML}
                    ${authorMetaTopHTML}
                    <div class="single-article-content">
                        ${mainContent}
                        ${bottomContent}
                        ${SocialShare(article, { variant: 'full' })}
                        ${authorBiosContainer}
                        ${CommentSection(id)}
                    </div>
                </div>
            </div>
        </section>
    `;
}

function attachCommentFormListeners() {
    const form = document.getElementById('comment-form');
    if (!form) return;

    const articleId = form.dataset.articleId;
    const contentInput = document.getElementById('comment-content');
    const submitBtn = document.getElementById('comment-submit-btn');
    const charCounter = document.getElementById('char-counter');
    const commentList = document.getElementById('comment-list');
    const MAX_CHARS = 500;

    function validateForm() {
        submitBtn.disabled = !(contentInput.value.trim().length > 0);
    }

    contentInput.addEventListener('input', () => {
        validateForm();
        const remaining = MAX_CHARS - contentInput.value.length;
        charCounter.textContent = remaining;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';

        const newComment = await postComment(articleId, contentInput.value.trim());

        if (newComment) {
            const newCommentHTML = Comment(newComment);
            commentList.insertAdjacentHTML('afterbegin', newCommentHTML);
            contentInput.value = '';
            charCounter.textContent = MAX_CHARS;
        } else {
            alert('Failed to post comment. You may need to log in again.');
        }
        submitBtn.textContent = 'Post Comment';
        validateForm();
    });
}

export async function render(container, articleId) {
    const { articles } = await getCombinedData();
    const article = articles.find(a => a.id == articleId);

    if (article) {
        const likedKey = `liked-article-${article.id}`;
        article.hasLiked = localStorage.getItem(likedKey) === 'true';

        container.innerHTML = createHTML(article);

        attachCommentFormListeners();

        const comments = await getComments(articleId);
        const commentList = document.getElementById('comment-list');
        if (commentList) {
            commentList.innerHTML = comments.map(Comment).join('');
        }

        const likeBtn = container.querySelector('.like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', async () => {
                if (likeBtn.classList.contains('liked')) return;
                const result = await likeArticle(article.id);
                if (result) {
                    likeBtn.querySelector('.like-count').textContent = result.likes;
                    likeBtn.classList.add('liked');
                    localStorage.setItem(likedKey, 'true');
                }
            });
        }
    } else {
        container.innerHTML = `<div class="container page"><p>Article not found.</p></div>`;
    }
}