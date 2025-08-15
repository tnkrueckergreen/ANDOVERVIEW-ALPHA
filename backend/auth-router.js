const express = require('express');
const bcrypt = require('bcrypt');
const { initializeDatabase } = require('./database');

const router = express.Router();
const saltRounds = 10; // Standard for bcrypt

// POST /api/users/signup
router.post('/signup', async (req, res) => {
    const db = await initializeDatabase();
    const { username, password } = req.body;

    if (!username || !password || password.length < 6) {
        return res.status(400).json({ error: 'Username and a password of at least 6 characters are required.' });
    }

    try {
        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already taken.' });
        }

        const password_hash = await bcrypt.hash(password, saltRounds);
        const result = await db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', username, password_hash);

        const user = { user_id: result.lastID, username: username };
        req.session.user = user; // Log the user in immediately after signup

        res.status(201).json(user);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'An error occurred during signup.' });
    }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
    const db = await initializeDatabase();
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const userSessionData = { user_id: user.user_id, username: user.username };
        req.session.user = userSessionData; // Create the session

        res.status(200).json(userSessionData);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

// POST /api/users/logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out.' });
        }
        res.clearCookie('connect.sid'); // The default session cookie name
        res.status(200).json({ message: 'Logged out successfully.' });
    });
});

// GET /api/users/status
router.get('/status', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ loggedIn: true, user: req.session.user });
    } else {
        res.status(200).json({ loggedIn: false });
    }
});

module.exports = router;