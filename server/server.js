require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { seedDatabase } = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger (concise)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (!req.path.startsWith('/assets/')) {
            console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});

// Database Initialization & Auto-seed
try {
    db.initDb();
    seedDatabase().catch(err => {
        console.error('[Database Seed Warning]', err.message);
    });
} catch (e) {
    console.error('[Database Init Error]', e);
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    try {
        const userCount = db.get('SELECT COUNT(*) as count FROM users');
        const alumniCount = db.get('SELECT COUNT(*) as count FROM alumni_profiles');
        const sessionCount = db.get('SELECT COUNT(*) as count FROM mentorship_sessions');
        return res.json({
            status: 'healthy',
            database: 'SQLite (Node.js Relational Engine)',
            timestamp: new Date().toISOString(),
            metrics: {
                users: userCount ? userCount.count : 0,
                alumni: alumniCount ? alumniCount.count : 0,
                sessions: sessionCount ? sessionCount.count : 0
            }
        });
    } catch (err) {
        return res.status(500).json({ status: 'unhealthy', error: err.message });
    }
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/alumni', require('./routes/alumni'));
app.use('/api/mentorship', require('./routes/mentorship'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/sql', require('./routes/sqlConsole'));


// Serve static frontend build if present
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found.' });
    }
    const indexPath = path.join(clientDistPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            next();
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Global Error]', err);
    res.status(500).json({ error: 'Internal server error occurred.', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Alumni-Student Mentorship & Networking Server`);
    console.log(`📡 Backend API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
});
