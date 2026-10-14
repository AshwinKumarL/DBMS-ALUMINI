const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'alumni-mentorship-super-secret-key-2026';

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.get(
            'SELECT id, email, role, first_name, last_name, avatar_url, headline, is_active FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return res.status(401).json({ error: 'User no longer exists.' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'User account has been deactivated. Please contact an administrator.' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

// Optional auth for public routes where current user context adds value (e.g. calculating match score)
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = db.get(
                'SELECT id, email, role, first_name, last_name, avatar_url, headline, is_active FROM users WHERE id = ?',
                [decoded.id]
            );
            if (user && user.is_active) {
                req.user = user;
            }
        } catch (e) {
            // Ignore optional auth error
        }
    }
    next();
}

module.exports = {
    JWT_SECRET,
    generateToken,
    authenticate,
    optionalAuth
};
