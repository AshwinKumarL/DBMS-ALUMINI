const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// Get all connections and requests for current user
router.get('/', authenticate, (req, res) => {
    try {
        const userId = req.user.id;

        // Accepted connections
        const accepted = db.query(
            `SELECT
                c.id as connection_id,
                c.status,
                c.created_at,
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.role,
                u.avatar_url,
                u.headline,
                CASE
                    WHEN u.role = 'alumni' THEN ap.current_company
                    ELSE sp.institution
                END as organization,
                CASE
                    WHEN u.role = 'alumni' THEN ap.current_position
                    ELSE sp.degree
                END as position_or_degree
            FROM connections c
            JOIN users u ON (CASE WHEN c.requester_id = ? THEN c.addressee_id ELSE c.requester_id END) = u.id
            LEFT JOIN alumni_profiles ap ON u.id = ap.user_id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE (c.requester_id = ? OR c.addressee_id = ?) AND c.status = 'accepted' AND u.is_active = 1
            ORDER BY c.updated_at DESC`,
            [userId, userId, userId]
        );

        // Pending incoming requests
        const incoming = db.query(
            `SELECT
                c.id as connection_id,
                c.status,
                c.note,
                c.created_at,
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.role,
                u.avatar_url,
                u.headline,
                CASE
                    WHEN u.role = 'alumni' THEN ap.current_company
                    ELSE sp.institution
                END as organization,
                CASE
                    WHEN u.role = 'alumni' THEN ap.current_position
                    ELSE sp.degree
                END as position_or_degree
            FROM connections c
            JOIN users u ON c.requester_id = u.id
            LEFT JOIN alumni_profiles ap ON u.id = ap.user_id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE c.addressee_id = ? AND c.status = 'pending' AND u.is_active = 1
            ORDER BY c.created_at DESC`,
            [userId]
        );

        // Pending outgoing requests
        const outgoing = db.query(
            `SELECT
                c.id as connection_id,
                c.status,
                c.note,
                c.created_at,
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.avatar_url,
                u.headline
            FROM connections c
            JOIN users u ON c.addressee_id = u.id
            WHERE c.requester_id = ? AND c.status = 'pending' AND u.is_active = 1
            ORDER BY c.created_at DESC`,
            [userId]
        );

        return res.json({
            accepted,
            incoming,
            outgoing,
            totalConnections: accepted.length
        });
    } catch (err) {
        console.error('[Get Connections Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve connections.' });
    }
});

// Check status between logged in user and target user
router.get('/status/:targetUserId', authenticate, (req, res) => {
    try {
        const targetUserId = Number(req.params.targetUserId);
        const userId = req.user.id;

        if (userId === targetUserId) {
            return res.json({ status: 'self' });
        }

        const conn = db.get(
            `SELECT * FROM connections
             WHERE (requester_id = ? AND addressee_id = ?)
                OR (requester_id = ? AND addressee_id = ?)`,
            [userId, targetUserId, targetUserId, userId]
        );

        if (!conn) {
            return res.json({ status: 'none' });
        }

        return res.json({
            status: conn.status,
            isRequester: conn.requester_id === userId,
            connectionId: conn.id
        });
    } catch (err) {
        console.error('[Connection Status Error]', err);
        return res.status(500).json({ error: 'Failed to check connection status.' });
    }
});

// Send connection request
router.post('/request', authenticate, (req, res) => {
    try {
        const { targetUserId, note } = req.body;
        const addresseeId = Number(targetUserId);

        if (!addresseeId || addresseeId === req.user.id) {
            return res.status(400).json({ error: 'Invalid target user ID.' });
        }

        const targetUser = db.get('SELECT id, first_name, last_name FROM users WHERE id = ? AND is_active = 1', [addresseeId]);
        if (!targetUser) {
            return res.status(404).json({ error: 'Target user not found.' });
        }

        const existing = db.get(
            `SELECT * FROM connections
             WHERE (requester_id = ? AND addressee_id = ?)
                OR (requester_id = ? AND addressee_id = ?)`,
            [req.user.id, addresseeId, addresseeId, req.user.id]
        );

        if (existing) {
            if (existing.status === 'accepted') {
                return res.status(409).json({ error: 'You are already connected with this user.' });
            }
            if (existing.status === 'pending') {
                return res.status(409).json({ error: 'A connection request is already pending between you.' });
            }
        }

        let newConnId;
        db.transaction((tx) => {
            const result = tx.run(
                'INSERT INTO connections (requester_id, addressee_id, status, note) VALUES (?, ?, "pending", ?)',
                [req.user.id, addresseeId, note ? note.trim() : null]
            );
            newConnId = Number(result.lastInsertRowid);

            // Notify target user
            tx.run(
                `INSERT INTO notifications (user_id, type, title, message, link)
                 VALUES (?, 'connection_request', 'New Connection Request', ?, '/network')`,
                [
                    addresseeId,
                    `${req.user.first_name} ${req.user.last_name} sent you a connection request.`
                ]
            );
        });

        return res.status(201).json({
            message: 'Connection request sent successfully!',
            connectionId: newConnId
        });
    } catch (err) {
        console.error('[Send Connection Error]', err);
        return res.status(500).json({ error: 'Failed to send connection request.' });
    }
});

// Respond to connection request (Accept or Decline)
router.patch('/:id/respond', authenticate, (req, res) => {
    try {
        const connectionId = Number(req.params.id);
        const { action } = req.body; // 'accept' or 'decline'

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({ error: 'Action must be "accept" or "decline".' });
        }

        const conn = db.get(
            'SELECT * FROM connections WHERE id = ? AND addressee_id = ?',
            [connectionId, req.user.id]
        );

        if (!conn) {
            return res.status(404).json({ error: 'Connection request not found or not addressed to you.' });
        }

        const newStatus = action === 'accept' ? 'accepted' : 'declined';

        db.transaction((tx) => {
            tx.run(
                'UPDATE connections SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newStatus, connectionId]
            );

            if (action === 'accept') {
                tx.run(
                    `INSERT INTO notifications (user_id, type, title, message, link)
                     VALUES (?, 'connection_accepted', 'Connection Request Accepted', ?, '/network')`,
                    [
                        conn.requester_id,
                        `${req.user.first_name} ${req.user.last_name} accepted your connection request.`
                    ]
                );
            }
        });

        return res.json({ message: `Connection request ${newStatus}.` });
    } catch (err) {
        console.error('[Respond Connection Error]', err);
        return res.status(500).json({ error: 'Failed to respond to connection request.' });
    }
});

// Remove connection or withdraw request
router.delete('/:id', authenticate, (req, res) => {
    try {
        const connectionId = Number(req.params.id);
        const conn = db.get(
            'SELECT * FROM connections WHERE id = ? AND (requester_id = ? OR addressee_id = ?)',
            [connectionId, req.user.id, req.user.id]
        );

        if (!conn) {
            return res.status(404).json({ error: 'Connection record not found.' });
        }

        db.run('DELETE FROM connections WHERE id = ?', [connectionId]);
        return res.json({ message: 'Connection removed successfully.' });
    } catch (err) {
        console.error('[Remove Connection Error]', err);
        return res.status(500).json({ error: 'Failed to remove connection.' });
    }
});

module.exports = router;
