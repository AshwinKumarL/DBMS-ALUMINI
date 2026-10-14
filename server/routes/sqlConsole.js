const express = require('express');
const router = express.Router();
const db = require('../db');

// POST execute raw SQL query
router.post('/execute', (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ success: false, error: 'Query string is required.' });
    }

    const trimmed = query.trim();
    const startTime = process.hrtime();

    try {
        const isSelect = /^(SELECT|PRAGMA|EXPLAIN|WITH)/i.test(trimmed);

        if (isSelect) {
            const results = db.query(trimmed);
            const diff = process.hrtime(startTime);
            const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

            res.json({
                success: true,
                type: 'SELECT',
                rowCount: results.length,
                executionTimeMs: `${executionTimeMs} ms`,
                data: results
            });
        } else {
            const result = db.run(trimmed);
            const diff = process.hrtime(startTime);
            const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

            res.json({
                success: true,
                type: 'MUTATION',
                changes: result.changes,
                lastInsertRowid: result.lastInsertRowid !== undefined ? Number(result.lastInsertRowid) : null,
                executionTimeMs: `${executionTimeMs} ms`,
                message: `Query executed successfully. ${result.changes || 0} row(s) affected.`
            });
        }
    } catch (err) {
        const diff = process.hrtime(startTime);
        const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
        res.status(400).json({
            success: false,
            error: err.message,
            executionTimeMs: `${executionTimeMs} ms`
        });
    }
});

// GET database schema inspection & metadata (for ER diagram and schema explorer)
router.get('/schema', (req, res) => {
    try {
        const tables = db.query(`
            SELECT name, type, sql 
            FROM sqlite_master 
            WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
            ORDER BY type, name
        `);

        const schema = tables.map(t => {
            const columns = db.query(`PRAGMA table_info("${t.name}")`);
            const foreignKeys = db.query(`PRAGMA foreign_key_list("${t.name}")`);
            const countResult = t.type === 'table' ? db.get(`SELECT COUNT(*) as count FROM "${t.name}"`) : null;

            return {
                name: t.name,
                type: t.type,
                ddl: t.sql,
                rowCount: countResult ? countResult.count : 0,
                columns: columns.map(c => ({
                    cid: c.cid,
                    name: c.name,
                    type: c.type,
                    notNull: Boolean(c.notnull),
                    defaultValue: c.dflt_value,
                    isPk: Boolean(c.pk)
                })),
                foreignKeys: foreignKeys.map(fk => ({
                    id: fk.id,
                    seq: fk.seq,
                    table: fk.table,
                    from: fk.from,
                    to: fk.to,
                    onUpdate: fk.on_update,
                    onDelete: fk.on_delete
                }))
            };
        });

        res.json({ success: true, schema });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET statistics for DBMS Dashboard
router.get('/stats', (req, res) => {
    try {
        const users = db.get('SELECT COUNT(*) as count FROM users');
        const alumni = db.get('SELECT COUNT(*) as count FROM alumni_profiles');
        const students = db.get('SELECT COUNT(*) as count FROM student_profiles');
        const requests = db.get('SELECT COUNT(*) as count FROM mentorship_requests');
        const sessions = db.get('SELECT COUNT(*) as count FROM mentorship_sessions');
        const skills = db.get('SELECT COUNT(*) as count FROM skills');
        const feedback = db.get('SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM session_feedback');
        const connections = db.get('SELECT COUNT(*) as count FROM connections WHERE status = "accepted"');

        res.json({
            success: true,
            stats: {
                totalUsers: users?.count || 0,
                totalAlumni: alumni?.count || 0,
                totalStudents: students?.count || 0,
                totalRequests: requests?.count || 0,
                totalSessions: sessions?.count || 0,
                totalSkills: skills?.count || 0,
                totalFeedback: feedback?.count || 0,
                avgRating: feedback?.avg_rating ? Number(Number(feedback.avg_rating).toFixed(2)) : 5.0,
                totalConnections: connections?.count || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
