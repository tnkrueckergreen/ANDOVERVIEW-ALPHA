let cachedCombinedData = null;

export async function getCombinedData() {
    if (cachedCombinedData) {
        return cachedCombinedData;
    }
    try {
        const response = await fetch('/api/articles');
        if (!response.ok) {
            throw new Error(`Failed to fetch data from server: ${response.statusText}`);
        }
        const data = await response.json();
        if (typeof marked !== 'undefined') {
            marked.setOptions({ mangle: false, headerIds: false });
            data.articles.forEach(article => {
                article.description = marked.parseInline(article.rawDescription || '');
                const markdownContent = article.content || '';
                article.content = marked.parse(markdownContent);
            });
        }
        cachedCombinedData = data;
        return cachedCombinedData;
    } catch (error) {
        console.error("Could not fetch data:", error);
        return { articles: [], staff: [] };
    }
}

export async function likeArticle(articleId) {
    try {
        const response = await fetch(`/api/articles/${articleId}/like`, {
            method: 'POST',
            credentials: 'include' // <-- THE FIX #1: Ensure session cookie is sent.
        });
        if (!response.ok) throw new Error('Like request failed');
        return await response.json();
    } catch (error) {
        console.error('Failed to like article:', error);
        return null;
    }
}

export async function getComments(articleId) {
    try {
        const response = await fetch(`/api/articles/${articleId}/comments`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        return await response.json();
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

export async function postComment(articleId, content) {
    try {
        const response = await fetch(`/api/articles/${articleId}/comments`, {
            method: 'POST',
            credentials: 'include', // <-- THE FIX #2: Ensure session cookie is sent.
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) throw new Error('Failed to post comment');
        return await response.json();
    } catch (error) {
        console.error('Error posting comment:', error);
        return null;
    }
}