const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// Submit a new mentorship request (Student -> Alumni)
router.post('/requests', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can initiate mentorship requests.' });
        }

        const { alumniId, topic, goals, preferredSchedule, message } = req.body;
        if (!alumniId || !topic || !message) {
            return res.status(400).json({ error: 'Alumni ID, topic, and message are required.' });
        }

        // Validate alumni exists and is active
        const alumni = db.get('SELECT * FROM users WHERE id = ? AND role = "alumni" AND is_active = 1', [Number(alumniId)]);
        if (!alumni) {
            return res.status(404).json({ error: 'Alumni mentor not found or inactive.' });
        }

        // Check if pending request already exists
        const existing = db.get(
            `SELECT id, status FROM mentorship_requests
             WHERE student_id = ? AND alumni_id = ? AND status = 'pending'`,
            [req.user.id, Number(alumniId)]
        );

        if (existing) {
            return res.status(409).json({ error: 'You already have a pending mentorship request with this mentor.' });
        }

        let newRequestId;
        db.transaction((tx) => {
            const insert = tx.run(
                `INSERT INTO mentorship_requests (
                    student_id, alumni_id, topic, goals, preferred_schedule, message, status
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
                [
                    req.user.id,
                    Number(alumniId),
                    topic.trim(),
                    goals ? goals.trim() : null,
                    preferredSchedule ? preferredSchedule.trim() : null,
                    message.trim()
                ]
            );
            newRequestId = Number(insert.lastInsertRowid);

            // Create notification for alumni
            tx.run(
                `INSERT INTO notifications (user_id, type, title, message, link)
                 VALUES (?, 'mentorship_request', 'New Mentorship Request', ?, '/mentorship')`,
                [
                    Number(alumniId),
                    `${req.user.first_name} ${req.user.last_name} requested mentorship on "${topic}".`
                ]
            );
        });

        const createdRequest = db.get('SELECT * FROM mentorship_requests WHERE id = ?', [newRequestId]);
        return res.status(201).json({
            message: 'Mentorship request submitted successfully!',
            request: createdRequest
        });
    } catch (err) {
        console.error('[Create Mentorship Request Error]', err);
        return res.status(500).json({ error: 'Failed to create mentorship request.' });
    }
});

// Get user's mentorship requests (incoming for alumni, outgoing for student)
router.get('/requests', authenticate, (req, res) => {
    try {
        const { status } = req.query;
        const userId = req.user.id;
        const isStudent = req.user.role === 'student';

        let query = `
            SELECT
                r.*,
                s.first_name as student_first_name,
                s.last_name as student_last_name,
                s.email as student_email,
                s.avatar_url as student_avatar,
                sp.degree as student_degree,
                sp.field_of_study as student_field_of_study,
                sp.expected_graduation_year as student_grad_year,
                a.first_name as alumni_first_name,
                a.last_name as alumni_last_name,
                a.email as alumni_email,
                a.avatar_url as alumni_avatar,
                ap.current_company as alumni_company,
                ap.current_position as alumni_position,
                ap.industry as alumni_industry
            FROM mentorship_requests r
            JOIN users s ON r.student_id = s.id
            JOIN student_profiles sp ON s.id = sp.user_id
            JOIN users a ON r.alumni_id = a.id
            JOIN alumni_profiles ap ON a.id = ap.user_id
            WHERE ${isStudent ? 'r.student_id = ?' : 'r.alumni_id = ?'}
        `;

        const params = [userId];
        if (status && status !== 'all') {
            query += ' AND r.status = ?';
            params.push(status);
        }

        query += ' ORDER BY r.created_at DESC';

        const requests = db.query(query, params);
        return res.json({ requests });
    } catch (err) {
        console.error('[Get Mentorship Requests Error]', err);
        return res.status(500).json({ error: 'Failed to fetch mentorship requests.' });
    }
});

// Respond to mentorship request (Alumni: Accept or Decline)
router.patch('/requests/:id/respond', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ error: 'Only alumni mentors can accept or decline requests.' });
        }

        const requestId = Number(req.params.id);
        const { action, responseNote } = req.body; // action: 'accept' or 'decline'

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({ error: 'Action must be either "accept" or "decline".' });
        }

        const request = db.get(
            'SELECT * FROM mentorship_requests WHERE id = ? AND alumni_id = ?',
            [requestId, req.user.id]
        );

        if (!request) {
            return res.status(404).json({ error: 'Mentorship request not found.' });
        }

        const newStatus = action === 'accept' ? 'accepted' : 'declined';
        const notifType = action === 'accept' ? 'mentorship_accepted' : 'mentorship_declined';
        const notifTitle = action === 'accept' ? 'Mentorship Request Accepted! 🎉' : 'Mentorship Request Update';

        db.transaction((tx) => {
            tx.run(
                `UPDATE mentorship_requests
                 SET status = ?, response_note = ?, responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [newStatus, responseNote ? responseNote.trim() : null, requestId]
            );

            // Notify student
            tx.run(
                `INSERT INTO notifications (user_id, type, title, message, link)
                 VALUES (?, ?, ?, ?, '/mentorship')`,
                [
                    request.student_id,
                    notifType,
                    notifTitle,
                    `${req.user.first_name} ${req.user.last_name} has ${newStatus} your mentorship request for "${request.topic}".`
                ]
            );
        });

        const updated = db.get('SELECT * FROM mentorship_requests WHERE id = ?', [requestId]);
        return res.json({ message: `Mentorship request ${newStatus}.`, request: updated });
    } catch (err) {
        console.error('[Respond Mentorship Request Error]', err);
        return res.status(500).json({ error: 'Failed to respond to mentorship request.' });
    }
});

// Cancel mentorship request (Student)
router.patch('/requests/:id/cancel', authenticate, (req, res) => {
    try {
        const requestId = Number(req.params.id);
        const request = db.get(
            'SELECT * FROM mentorship_requests WHERE id = ? AND student_id = ?',
            [requestId, req.user.id]
        );

        if (!request) {
            return res.status(404).json({ error: 'Mentorship request not found.' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: `Cannot cancel a request that is already ${request.status}.` });
        }

        db.run(
            'UPDATE mentorship_requests SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [requestId]
        );

        return res.json({ message: 'Mentorship request cancelled.' });
    } catch (err) {
        console.error('[Cancel Request Error]', err);
        return res.status(500).json({ error: 'Failed to cancel request.' });
    }
});

// Schedule Mentorship Session
router.post('/sessions', authenticate, (req, res) => {
    try {
        const {
            requestId,
            studentId,
            alumniId,
            topic,
            scheduledAt,
            durationMinutes,
            meetingLink,
            locationType,
            agenda,
            notes
        } = req.body;

        // Either student or alumni can propose scheduling once accepted
        const effectiveStudentId = req.user.role === 'student' ? req.user.id : Number(studentId);
        const effectiveAlumniId = req.user.role === 'alumni' ? req.user.id : Number(alumniId);

        if (!effectiveStudentId || !effectiveAlumniId || !scheduledAt || !topic) {
            return res.status(400).json({ error: 'Scheduled date, topic, student ID, and alumni ID are required.' });
        }

        let newSessionId;
        db.transaction((tx) => {
            const insert = tx.run(
                `INSERT INTO mentorship_sessions (
                    request_id, student_id, alumni_id, topic, scheduled_at, duration_minutes,
                    meeting_link, location_type, agenda, notes, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
                [
                    requestId ? Number(requestId) : null,
                    effectiveStudentId,
                    effectiveAlumniId,
                    topic.trim(),
                    scheduledAt,
                    durationMinutes ? Number(durationMinutes) : 45,
                    meetingLink ? meetingLink.trim() : 'https://meet.google.com/alm-session-' + Date.now().toString(36),
                    locationType || 'virtual',
                    agenda ? agenda.trim() : null,
                    notes ? notes.trim() : null
                ]
            );
            newSessionId = Number(insert.lastInsertRowid);

            // Notify counter-party
            const recipientId = req.user.id === effectiveStudentId ? effectiveAlumniId : effectiveStudentId;
            tx.run(
                `INSERT INTO notifications (user_id, type, title, message, link)
                 VALUES (?, 'session_scheduled', 'Mentorship Session Scheduled', ?, '/mentorship')`,
                [
                    recipientId,
                    `${req.user.first_name} scheduled a mentorship session on "${topic}" for ${scheduledAt}.`
                ]
            );
        });

        const createdSession = db.get('SELECT * FROM mentorship_sessions WHERE id = ?', [newSessionId]);
        return res.status(201).json({
            message: 'Mentorship session scheduled successfully!',
            session: createdSession
        });
    } catch (err) {
        console.error('[Schedule Session Error]', err);
        return res.status(500).json({ error: 'Failed to schedule mentorship session.' });
    }
});

// Get user's mentorship sessions (upcoming & past)
router.get('/sessions', authenticate, (req, res) => {
    try {
        const userId = req.user.id;
        const isStudent = req.user.role === 'student';

        const sessions = db.query(
            `SELECT
                ms.*,
                s.first_name as student_first_name,
                s.last_name as student_last_name,
                s.avatar_url as student_avatar,
                s.email as student_email,
                a.first_name as alumni_first_name,
                a.last_name as alumni_last_name,
                a.avatar_url as alumni_avatar,
                a.email as alumni_email,
                ap.current_company as alumni_company,
                ap.current_position as alumni_position,
                fb.rating as feedback_rating,
                fb.feedback_text as feedback_text,
                fb.tags as feedback_tags
            FROM mentorship_sessions ms
            JOIN users s ON ms.student_id = s.id
            JOIN users a ON ms.alumni_id = a.id
            JOIN alumni_profiles ap ON a.id = ap.user_id
            LEFT JOIN session_feedback fb ON ms.id = fb.session_id
            WHERE ${isStudent ? 'ms.student_id = ?' : 'ms.alumni_id = ?'}
            ORDER BY ms.scheduled_at DESC`,
            [userId]
        );

        return res.json({ sessions });
    } catch (err) {
        console.error('[Get Sessions Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve mentorship sessions.' });
    }
});

// Mark Session as Completed
router.patch('/sessions/:id/complete', authenticate, (req, res) => {
    try {
        const sessionId = Number(req.params.id);
        const session = db.get(
            `SELECT * FROM mentorship_sessions WHERE id = ? AND (student_id = ? OR alumni_id = ?)`,
            [sessionId, req.user.id, req.user.id]
        );

        if (!session) {
            return res.status(404).json({ error: 'Session not found or permission denied.' });
        }

        db.transaction((tx) => {
            tx.run(
                'UPDATE mentorship_sessions SET status = "completed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [sessionId]
            );

            // Also mark parent request as completed if any
            if (session.request_id) {
                tx.run('UPDATE mentorship_requests SET status = "completed" WHERE id = ?', [session.request_id]);
            }

            // If alumni marked it completed, notify student to submit feedback
            if (req.user.id === session.alumni_id) {
                tx.run(
                    `INSERT INTO notifications (user_id, type, title, message, link)
                     VALUES (?, 'session_completed', 'Session Completed - Leave a Review', ?, '/mentorship')`,
                    [
                        session.student_id,
                        `Your session with ${req.user.first_name} has ended. Share your rating and feedback!`
                    ]
                );
            }
        });

        return res.json({ message: 'Session marked as completed.' });
    } catch (err) {
        console.error('[Complete Session Error]', err);
        return res.status(500).json({ error: 'Failed to complete session.' });
    }
});

// Submit Feedback and Rating for a completed session (Student -> Alumni)
router.post('/sessions/:id/feedback', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can submit session ratings and feedback.' });
        }

        const sessionId = Number(req.params.id);
        const { rating, feedbackText, tags } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
        }

        const session = db.get(
            'SELECT * FROM mentorship_sessions WHERE id = ? AND student_id = ?',
            [sessionId, req.user.id]
        );

        if (!session) {
            return res.status(404).json({ error: 'Session not found or not associated with your account.' });
        }

        const existingFeedback = db.get('SELECT id FROM session_feedback WHERE session_id = ?', [sessionId]);
        if (existingFeedback) {
            return res.status(409).json({ error: 'You have already submitted feedback for this session.' });
        }

        db.transaction((tx) => {
            tx.run(
                `INSERT INTO session_feedback (
                    session_id, student_id, alumni_id, rating, feedback_text, tags, is_public
                ) VALUES (?, ?, ?, ?, ?, ?, 1)`,
                [
                    sessionId,
                    req.user.id,
                    session.alumni_id,
                    Number(rating),
                    feedbackText ? feedbackText.trim() : null,
                    tags ? tags.trim() : null
                ]
            );

            // Notify alumni
            tx.run(
                `INSERT INTO notifications (user_id, type, title, message, link)
                 VALUES (?, 'session_completed', 'New Mentorship Feedback Received', ?, '/profile')`,
                [
                    session.alumni_id,
                    `${req.user.first_name} gave you a ${rating}-star review for session "${session.topic}".`
                ]
            );
        });

        return res.status(201).json({ message: 'Thank you for submitting your mentorship feedback!' });
    } catch (err) {
        console.error('[Session Feedback Error]', err);
        return res.status(500).json({ error: 'Failed to submit feedback.' });
    }
});

// ========================================================
// DBMS Direct Session Endpoints (Table Management)
// ========================================================

// GET all sessions across entire database (DBMS view)
router.get('/all-sessions', (req, res) => {
    try {
        const sessions = db.query(`
            SELECT 
                ms.id,
                ms.request_id,
                ms.student_id,
                ms.alumni_id,
                ms.topic,
                ms.scheduled_at,
                ms.duration_minutes,
                ms.meeting_link,
                ms.location_type,
                ms.agenda,
                ms.notes,
                ms.status,
                ms.created_at,
                u_stu.first_name || ' ' || u_stu.last_name AS student_name,
                u_stu.email AS student_email,
                u_alm.first_name || ' ' || u_alm.last_name AS alumni_name,
                u_alm.email AS alumni_email,
                ap.current_company AS alumni_company
            FROM mentorship_sessions ms
            JOIN users u_stu ON ms.student_id = u_stu.id
            JOIN users u_alm ON ms.alumni_id = u_alm.id
            LEFT JOIN alumni_profiles ap ON u_alm.id = ap.user_id
            ORDER BY ms.id DESC
        `);
        return res.json({ success: true, sessions });
    } catch (err) {
        console.error('[DBMS Get All Sessions Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve all sessions: ' + err.message });
    }
});

// Direct Session Insert (DBMS)
router.post('/direct-insert', (req, res) => {
    try {
        const {
            studentId,
            alumniId,
            topic,
            scheduledAt,
            durationMinutes,
            locationType,
            meetingLink,
            status,
            notes
        } = req.body;

        if (!studentId || !alumniId || !topic) {
            return res.status(400).json({ error: 'Student, Mentor, and Topic are required fields.' });
        }

        const scheduledTime = scheduledAt || new Date(Date.now() + 86400000).toISOString().replace('T', ' ').substring(0, 16);
        const link = meetingLink || `https://meet.google.com/dbms-sess-${Date.now().toString(36)}`;
        const duration = Number(durationMinutes) || 45;
        const loc = locationType || 'virtual';
        const sessStatus = status || 'scheduled';

        const insert = db.run(`
            INSERT INTO mentorship_sessions (
                student_id, alumni_id, topic, scheduled_at, duration_minutes,
                meeting_link, location_type, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            Number(studentId),
            Number(alumniId),
            topic.trim(),
            scheduledTime,
            duration,
            link.trim(),
            loc,
            sessStatus,
            notes ? notes.trim() : null
        ]);

        const newId = Number(insert.lastInsertRowid);
        const created = db.get(`
            SELECT 
                ms.*,
                u_stu.first_name || ' ' || u_stu.last_name AS student_name,
                u_alm.first_name || ' ' || u_alm.last_name AS alumni_name
            FROM mentorship_sessions ms
            JOIN users u_stu ON ms.student_id = u_stu.id
            JOIN users u_alm ON ms.alumni_id = u_alm.id
            WHERE ms.id = ?
        `, [newId]);

        return res.status(201).json({
            success: true,
            message: `Session #${newId} ("${topic}") successfully inserted into mentorship_sessions table.`,
            session: created
        });
    } catch (err) {
        console.error('[DBMS Direct Session Insert Error]', err);
        return res.status(500).json({ error: 'Failed to insert session: ' + err.message });
    }
});

// Direct Session Delete (DBMS)
router.delete('/sessions/:id', (req, res) => {
    try {
        const sessionId = Number(req.params.id);
        const session = db.get('SELECT * FROM mentorship_sessions WHERE id = ?', [sessionId]);
        if (!session) {
            return res.status(404).json({ error: 'Session record not found.' });
        }

        db.run('DELETE FROM mentorship_sessions WHERE id = ?', [sessionId]);
        return res.json({
            success: true,
            message: `Session #${sessionId} ("${session.topic}") deleted successfully.`
        });
    } catch (err) {
        console.error('[DBMS Delete Session Error]', err);
        return res.status(500).json({ error: 'Failed to delete session: ' + err.message });
    }
});

module.exports = router;
