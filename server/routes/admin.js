const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Submit a moderation report (Open to any authenticated user)
router.post('/reports', authenticate, (req, res) => {
    try {
        const { reportedUserId, reason, details } = req.body;
        const targetUserId = Number(reportedUserId);

        if (!targetUserId || !reason || !details) {
            return res.status(400).json({ error: 'Reported user ID, reason, and details are required.' });
        }

        const targetUser = db.get('SELECT id FROM users WHERE id = ?', [targetUserId]);
        if (!targetUser) {
            return res.status(404).json({ error: 'Target user not found.' });
        }

        let newReportId;
        db.transaction((tx) => {
            const insert = tx.run(
                `INSERT INTO reports (reporter_id, reported_user_id, reason, details, status)
                 VALUES (?, ?, ?, ?, 'pending')`,
                [req.user.id, targetUserId, reason, details.trim()]
            );
            newReportId = Number(insert.lastInsertRowid);

            // Notify all admins
            const admins = tx.query("SELECT id FROM users WHERE role = 'admin'");
            for (const admin of admins) {
                tx.run(
                    `INSERT INTO notifications (user_id, type, title, message, link)
                     VALUES (?, 'system_alert', 'New Moderation Report Filed', ?, '/admin')`,
                    [admin.id, `Report filed against User #${targetUserId} for "${reason}".`]
                );
            }
        });

        return res.status(201).json({
            message: 'Report submitted for review. Thank you for keeping our community safe.',
            reportId: newReportId
        });
    } catch (err) {
        console.error('[Submit Report Error]', err);
        return res.status(500).json({ error: 'Failed to submit report.' });
    }
});

// All following routes require 'admin' role
router.use(authenticate, requireRole('admin'));

// Platform Metrics and Analytics
router.get('/metrics', (req, res) => {
    try {
        const totalUsers = db.get('SELECT COUNT(*) as count FROM users');
        const studentsCount = db.get("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
        const alumniCount = db.get("SELECT COUNT(*) as count FROM users WHERE role = 'alumni'");
        const verifiedAlumniCount = db.get("SELECT COUNT(*) as count FROM alumni_profiles WHERE verification_status = 'verified'");
        const pendingAlumniCount = db.get("SELECT COUNT(*) as count FROM alumni_profiles WHERE verification_status = 'pending'");

        const totalRequests = db.get('SELECT COUNT(*) as count FROM mentorship_requests');
        const acceptedRequests = db.get("SELECT COUNT(*) as count FROM mentorship_requests WHERE status = 'accepted' OR status = 'completed'");
        const totalSessions = db.get('SELECT COUNT(*) as count FROM mentorship_sessions');
        const completedSessions = db.get("SELECT COUNT(*) as count FROM mentorship_sessions WHERE status = 'completed'");

        const avgRatingRow = db.get('SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM session_feedback');
        const totalConnections = db.get("SELECT COUNT(*) as count FROM connections WHERE status = 'accepted'");
        const totalMessages = db.get('SELECT COUNT(*) as count FROM messages');
        const openReportsCount = db.get("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'");

        // Industry distribution
        const industryStats = db.query(
            `SELECT industry, COUNT(*) as count
             FROM alumni_profiles
             WHERE industry IS NOT NULL AND industry != ''
             GROUP BY industry
             ORDER BY count DESC LIMIT 5`
        );

        // Recent activity
        const recentSessions = db.query(
            `SELECT ms.id, ms.topic, ms.scheduled_at, ms.status,
                    s.first_name as student_first_name, s.last_name as student_last_name,
                    a.first_name as alumni_first_name, a.last_name as alumni_last_name
             FROM mentorship_sessions ms
             JOIN users s ON ms.student_id = s.id
             JOIN users a ON ms.alumni_id = a.id
             ORDER BY ms.created_at DESC LIMIT 5`
        );

        return res.json({
            metrics: {
                totalUsers: totalUsers.count,
                studentsCount: studentsCount.count,
                alumniCount: alumniCount.count,
                verifiedAlumniCount: verifiedAlumniCount.count,
                pendingAlumniCount: pendingAlumniCount.count,
                verificationRate: alumniCount.count > 0 ? Math.round((verifiedAlumniCount.count / alumniCount.count) * 100) : 0,
                totalRequests: totalRequests.count,
                acceptedRequests: acceptedRequests.count,
                totalSessions: totalSessions.count,
                completedSessions: completedSessions.count,
                averageRating: avgRatingRow.avg_rating ? Number(Number(avgRatingRow.avg_rating).toFixed(2)) : 5.0,
                totalReviews: avgRatingRow.review_count,
                totalConnections: totalConnections.count,
                totalMessages: totalMessages.count,
                openReportsCount: openReportsCount.count
            },
            industryStats,
            recentSessions
        });
    } catch (err) {
        console.error('[Admin Metrics Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve admin platform metrics.' });
    }
});

// Alumni Verification Queue
router.get('/alumni-verifications', (req, res) => {
    try {
        const { status } = req.query; // 'pending', 'verified', 'rejected', or undefined (all)

        let query = `
            SELECT
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.avatar_url,
                u.created_at as registered_at,
                ap.current_company,
                ap.current_position,
                ap.industry,
                ap.degree,
                ap.field_of_study,
                ap.graduation_year,
                ap.years_experience,
                ap.linkedin_url,
                ap.verification_status,
                ap.verified_at,
                ap.rejection_reason,
                admin.first_name as verified_by_name
            FROM alumni_profiles ap
            JOIN users u ON ap.user_id = u.id
            LEFT JOIN users admin ON ap.verified_by = admin.id
        `;

        const params = [];
        if (status && ['pending', 'verified', 'rejected'].includes(status)) {
            query += ' WHERE ap.verification_status = ?';
            params.push(status);
        }

        query += " ORDER BY CASE ap.verification_status WHEN 'pending' THEN 1 WHEN 'rejected' THEN 2 ELSE 3 END, u.created_at DESC";

        const verifications = db.query(query, params);
        return res.json({ verifications });
    } catch (err) {
        console.error('[Admin Verifications Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve alumni verifications list.' });
    }
});

// Verify or Reject Alumni
router.patch('/verify-alumni/:userId', (req, res) => {
    try {
        const targetUserId = Number(req.params.userId);
        const { action, reason } = req.body; // action: 'verify' or 'reject'

        if (!['verify', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Action must be "verify" or "reject".' });
        }

        const alumni = db.get('SELECT * FROM alumni_profiles WHERE user_id = ?', [targetUserId]);
        if (!alumni) {
            return res.status(404).json({ error: 'Alumni profile not found.' });
        }

        const newStatus = action === 'verify' ? 'verified' : 'rejected';

        db.transaction((tx) => {
            tx.run(
                `UPDATE alumni_profiles SET
                    verification_status = ?,
                    verified_at = CURRENT_TIMESTAMP,
                    verified_by = ?,
                    rejection_reason = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?`,
                [newStatus, req.user.id, action === 'reject' ? (reason || 'Credentials could not be verified') : null, targetUserId]
            );

            // Notify alumni of verification status change
            const title = action === 'verify' ? 'Alumni Profile Verified! 🎓' : 'Alumni Profile Verification Notice';
            const message = action === 'verify'
                ? 'Congratulations! Your alumni credentials have been verified by administration. You now carry a verified mentor badge.'
                : `Your alumni verification was not approved. Reason: ${reason || 'Credentials could not be verified.'}`;

            tx.run(
                `INSERT INTO notifications (user_id, type, title, message, link)
                 VALUES (?, ?, ?, ?, '/profile')`,
                [targetUserId, action === 'verify' ? 'profile_verified' : 'profile_rejected', title, message]
            );
        });

        return res.json({ message: `Alumni account marked as ${newStatus}.` });
    } catch (err) {
        console.error('[Verify Alumni Error]', err);
        return res.status(500).json({ error: 'Failed to update alumni verification status.' });
    }
});

// List all users for administration
router.get('/users', (req, res) => {
    try {
        const { q, role, status } = req.query;

        let query = `
            SELECT
                u.id,
                u.email,
                u.role,
                u.first_name,
                u.last_name,
                u.avatar_url,
                u.headline,
                u.is_active,
                u.created_at,
                CASE
                    WHEN u.role = 'alumni' THEN ap.current_company
                    ELSE sp.institution
                END as organization,
                CASE
                    WHEN u.role = 'alumni' THEN ap.verification_status
                    ELSE NULL
                END as alumni_verification
            FROM users u
            LEFT JOIN alumni_profiles ap ON u.id = ap.user_id
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE 1=1
        `;

        const params = [];

        if (q && q.trim()) {
            const term = `%${q.trim()}%`;
            query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
            params.push(term, term, term);
        }

        if (role && role !== 'all') {
            query += ' AND u.role = ?';
            params.push(role);
        }

        if (status === 'active') {
            query += ' AND u.is_active = 1';
        } else if (status === 'inactive') {
            query += ' AND u.is_active = 0';
        }

        query += ' ORDER BY u.created_at DESC';

        const users = db.query(query, params);
        return res.json({ users });
    } catch (err) {
        console.error('[Admin List Users Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve users.' });
    }
});

// Toggle user active status
router.patch('/users/:id/status', (req, res) => {
    try {
        const targetUserId = Number(req.params.id);
        const { isActive } = req.body;

        if (targetUserId === req.user.id) {
            return res.status(400).json({ error: 'Cannot deactivate your own administrator account.' });
        }

        db.run(
            'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [isActive ? 1 : 0, targetUserId]
        );

        return res.json({ message: `User status updated to ${isActive ? 'active' : 'deactivated'}.` });
    } catch (err) {
        console.error('[Admin Toggle User Status Error]', err);
        return res.status(500).json({ error: 'Failed to update user status.' });
    }
});

// List Moderation Reports
router.get('/reports', (req, res) => {
    try {
        const reports = db.query(`
            SELECT
                r.*,
                reporter.first_name as reporter_first_name,
                reporter.last_name as reporter_last_name,
                reporter.email as reporter_email,
                reported.first_name as reported_first_name,
                reported.last_name as reported_last_name,
                reported.email as reported_email,
                reported.role as reported_role,
                resolver.first_name as resolver_first_name
            FROM reports r
            JOIN users reporter ON r.reporter_id = reporter.id
            JOIN users reported ON r.reported_user_id = reported.id
            LEFT JOIN users resolver ON r.resolved_by = resolver.id
            ORDER BY CASE r.status WHEN 'pending' THEN 1 ELSE 2 END, r.created_at DESC
        `);

        return res.json({ reports });
    } catch (err) {
        console.error('[Admin Reports Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve moderation reports.' });
    }
});

// Resolve Moderation Report
router.patch('/reports/:id/resolve', (req, res) => {
    try {
        const reportId = Number(req.params.id);
        const { resolution, resolutionNotes } = req.body; // resolution: 'resolved' or 'dismissed'

        if (!['resolved', 'dismissed'].includes(resolution)) {
            return res.status(400).json({ error: 'Resolution must be "resolved" or "dismissed".' });
        }

        db.run(
            `UPDATE reports SET
                status = ?,
                resolution_notes = ?,
                resolved_by = ?,
                resolved_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [resolution, resolutionNotes ? resolutionNotes.trim() : null, req.user.id, reportId]
        );

        return res.json({ message: `Report marked as ${resolution}.` });
    } catch (err) {
        console.error('[Admin Resolve Report Error]', err);
        return res.status(500).json({ error: 'Failed to resolve moderation report.' });
    }
});

module.exports = router;
