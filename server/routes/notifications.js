const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// Get all notifications for current user
router.get('/', authenticate, (req, res) => {
    try {
        const notifications = db.query(
            `SELECT * FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC LIMIT 50`,
            [req.user.id]
        );

        const unreadCount = db.get(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [req.user.id]
        );

        return res.json({
            notifications,
            unreadCount: unreadCount ? unreadCount.count : 0
        });
    } catch (err) {
        console.error('[Get Notifications Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve notifications.' });
    }
});

// Mark single notification as read
router.patch('/:id/read', authenticate, (req, res) => {
    try {
        const notifId = Number(req.params.id);
        db.run(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [notifId, req.user.id]
        );
        return res.json({ message: 'Notification marked as read.' });
    } catch (err) {
        console.error('[Mark Read Error]', err);
        return res.status(500).json({ error: 'Failed to update notification.' });
    }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, (req, res) => {
    try {
        db.run(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
            [req.user.id]
        );
        return res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
        console.error('[Mark All Read Error]', err);
        return res.status(500).json({ error: 'Failed to mark all notifications as read.' });
    }
});

// Delete a notification
router.delete('/:id', authenticate, (req, res) => {
    try {
        const notifId = Number(req.params.id);
        db.run('DELETE FROM notifications WHERE id = ? AND user_id = ?', [notifId, req.user.id]);
        return res.json({ message: 'Notification deleted.' });
    } catch (err) {
        console.error('[Delete Notification Error]', err);
        return res.status(500).json({ error: 'Failed to delete notification.' });
    }
});

module.exports = router;
