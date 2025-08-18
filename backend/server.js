const express = require('express');
const path = require('path');
const session = require('express-session');
const { initializeDatabase } = require('./database');
const apiRouter = require('./api-router');
const authRouter = require('./auth-router');

const app = express();

// --- THIS IS THE KEY CHANGE ---
// On Replit, we must use the port provided by the environment.
// On a local machine, it will fall back to 3000.
const PORT = process.env.PORT || 3000;
// ------------------------------

app.use(express.json());

app.use(session({
    secret: 'a-very-strong-and-secret-key-for-andoverview',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: 'auto',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

initializeDatabase();

app.use('/api', apiRouter);
app.use('/api/users', authRouter);

app.use(express.static(path.join(__dirname, '..')));

// --- THIS IS THE OTHER KEY CHANGE ---
// We bind to '0.0.0.0' to ensure it's accessible within Replit's network.
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running and listening on port ${PORT}`);
});