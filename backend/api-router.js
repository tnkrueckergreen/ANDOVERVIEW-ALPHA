const express = require('express');
const { initializeDatabase } = require('./database');
const { getCombinedDataFromFileSystem } = require('./content-parser');

const router = express.Router();

let cachedData = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'You must be logged in to perform this action.' });
    }
};

router.get('/articles', async (req, res) => {
    const db = await initializeDatabase();

    const now = Date.now();
    if (!cachedData || (now - lastCacheTime > CACHE_DURATION)) {
        cachedData = await getCombinedDataFromFileSystem();
        lastCacheTime = now;
    }

    const { articles, staff } = cachedData;

    try {
        const augmentedArticles = await Promise.all(articles.map(async (article) => {
            let dynamicData = await db.get('SELECT likes FROM articles WHERE article_id = ?', article.id);
            if (!dynamicData) {
                await db.run('INSERT OR IGNORE INTO articles (article_id, likes) VALUES (?, 0)', article.id);
                dynamicData = { likes: 0 };
            }
            return { ...article, likes: dynamicData.likes };
        }));

        res.json({ articles: augmentedArticles, staff });

    } catch (error) {
        console.error('Error augmenting articles with DB data:', error);
        res.status(500).json({ error: 'Failed to retrieve article data.' });
    }
});

router.post('/articles/:id/like', async (req, res) => {
    const db = await initializeDatabase();
    const articleId = req.params.id;
    await db.run('UPDATE articles SET likes = likes + 1 WHERE article_id = ?', articleId);
    const result = await db.get('SELECT likes FROM articles WHERE article_id = ?', articleId);
    res.status(200).json(result);
});

router.get('/articles/:id/comments', async (req, res) => {
    const db = await initializeDatabase();
    const articleId = req.params.id;
    const comments = await db.all('SELECT * FROM comments WHERE article_id = ? ORDER BY timestamp DESC', articleId);
    res.json(comments);
});

router.post('/articles/:id/comments', isAuthenticated, async (req, res) => {
    const db = await initializeDatabase();
    const articleId = req.params.id;
    const { content } = req.body;
    const { user_id, username } = req.session.user;

    if (!content) {
        return res.status(400).json({ error: 'Comment content is required.' });
    }

    try {
        const result = await db.run(
            'INSERT INTO comments (article_id, author_id, author_name, content) VALUES (?, ?, ?, ?)',
            articleId,
            user_id,
            username,
            content
        );

        const newComment = await db.get('SELECT * FROM comments WHERE comment_id = ?', result.lastID);
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).json({ error: 'An error occurred while posting the comment.' });
    }
});

module.exports = router;