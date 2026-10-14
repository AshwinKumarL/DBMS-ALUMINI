const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// Get all active conversations for current user
router.get('/conversations', authenticate, (req, res) => {
    try {
        const userId = req.user.id;

        // Get distinct user IDs current user has exchanged messages with
        const conversationUsers = db.query(
            `SELECT DISTINCT
                CASE WHEN sender_id = ? THEN recipient_id ELSE sender_id END as contact_id
             FROM messages
             WHERE sender_id = ? OR recipient_id = ?`,
            [userId, userId, userId]
        );

        const conversations = [];
        for (const row of conversationUsers) {
            const contact = db.get(
                `SELECT id, first_name, last_name, email, role, avatar_url, headline, is_active
                 FROM users WHERE id = ?`,
                [row.contact_id]
            );

            if (!contact) continue;

            const lastMessage = db.get(
                `SELECT id, sender_id, recipient_id, content, is_read, created_at
                 FROM messages
                 WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
                 ORDER BY created_at DESC LIMIT 1`,
                [userId, row.contact_id, row.contact_id, userId]
            );

            const unreadCount = db.get(
                `SELECT COUNT(*) as count
                 FROM messages
                 WHERE sender_id = ? AND recipient_id = ? AND is_read = 0`,
                [row.contact_id, userId]
            );

            conversations.push({
                contact,
                lastMessage,
                unreadCount: unreadCount ? unreadCount.count : 0
            });
        }

        // Sort by last message timestamp descending
        conversations.sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
            const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
            return timeB - timeA;
        });

        return res.json({ conversations });
    } catch (err) {
        console.error('[Get Conversations Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve conversations.' });
    }
});

// Get message thread between current user and a specific contact
router.get('/:contactId', authenticate, (req, res) => {
    try {
        const userId = req.user.id;
        const contactId = Number(req.params.contactId);

        const contact = db.get(
            `SELECT id, first_name, last_name, email, role, avatar_url, headline, is_active
             FROM users WHERE id = ?`,
            [contactId]
        );

        if (!contact) {
            return res.status(404).json({ error: 'Contact user not found.' });
        }

        // Fetch messages between them
        const messages = db.query(
            `SELECT id, sender_id, recipient_id, content, is_read, read_at, created_at
             FROM messages
             WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
             ORDER BY created_at ASC`,
            [userId, contactId, contactId, userId]
        );

        // Mark incoming unread messages as read
        db.run(
            `UPDATE messages
             SET is_read = 1, read_at = CURRENT_TIMESTAMP
             WHERE sender_id = ? AND recipient_id = ? AND is_read = 0`,
            [contactId, userId]
        );

        return res.json({
            contact,
            messages
        });
    } catch (err) {
        console.error('[Get Message Thread Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve message thread.' });
    }
});

// Send a message
router.post('/', authenticate, (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const targetId = Number(recipientId);

        if (!targetId || !content || !content.trim()) {
            return res.status(400).json({ error: 'Recipient ID and message content are required.' });
        }

        if (targetId === req.user.id) {
            return res.status(400).json({ error: 'Cannot send message to yourself.' });
        }

        const recipient = db.get('SELECT id, first_name, last_name FROM users WHERE id = ? AND is_active = 1', [targetId]);
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient user not found or inactive.' });
        }

        let newMsgId;
        db.transaction((tx) => {
            const insert = tx.run(
                'INSERT INTO messages (sender_id, recipient_id, content, is_read) VALUES (?, ?, ?, 0)',
                [req.user.id, targetId, content.trim()]
            );
            newMsgId = Number(insert.lastInsertRowid);

            // Create notification for recipient
            const snippet = content.trim().length > 60 ? content.trim().substring(0, 57) + '...' : content.trim();
            tx.run(
                `INSERT INTO notifications (user_id, type, title, message, link)
                 VALUES (?, 'new_message', ?, ?, '/messages')`,
                [
                    targetId,
                    `New message from ${req.user.first_name} ${req.user.last_name}`,
                    `"${snippet}"`
                ]
            );
        });

        const createdMessage = db.get('SELECT * FROM messages WHERE id = ?', [newMsgId]);
        return res.status(201).json({
            message: 'Message sent successfully!',
            data: createdMessage
        });
    } catch (err) {
        console.error('[Send Message Error]', err);
        return res.status(500).json({ error: 'Failed to send message.' });
    }
});

// Mark messages from contact as read
router.patch('/read/:contactId', authenticate, (req, res) => {
    try {
        const contactId = Number(req.params.contactId);
        db.run(
            `UPDATE messages
             SET is_read = 1, read_at = CURRENT_TIMESTAMP
             WHERE sender_id = ? AND recipient_id = ? AND is_read = 0`,
            [contactId, req.user.id]
        );
        return res.json({ message: 'Messages marked as read.' });
    } catch (err) {
        console.error('[Mark Read Error]', err);
        return res.status(500).json({ error: 'Failed to mark messages as read.' });
    }
});

module.exports = router;
