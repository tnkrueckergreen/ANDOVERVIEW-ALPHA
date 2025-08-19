const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

async function initializeDatabase() {
    if (db) return db;

    try {
        db = await open({
            filename: path.join(process.cwd(), 'my-database.sqlite'),
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS articles (
                article_id TEXT PRIMARY KEY,
                likes INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS comments (
                comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                article_id TEXT NOT NULL,
                author_id INTEGER NOT NULL,
                author_name TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
                FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE
            );
        `);

        console.log('Database initialized successfully.');
        return db;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

module.exports = { initializeDatabase };