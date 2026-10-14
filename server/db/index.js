const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'alumni_network.db');

let dbInstance = null;

function getDb() {
    if (!dbInstance) {
        dbInstance = new DatabaseSync(DB_PATH);
        // Enable foreign key constraints and WAL mode for optimal concurrent performance
        dbInstance.exec('PRAGMA foreign_keys = ON;');
        dbInstance.exec('PRAGMA journal_mode = WAL;');
    }
    return dbInstance;
}

function initDb() {
    const db = getDb();
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql);
        console.log('[Database] Schema initialized successfully.');
    }
}

// Helper methods with prepared statements
const db = {
    getDb,
    initDb,
    query(sql, params = []) {
        const stmt = getDb().prepare(sql);
        return stmt.all(...params);
    },
    get(sql, params = []) {
        const stmt = getDb().prepare(sql);
        const rows = stmt.all(...params);
        return rows.length > 0 ? rows[0] : null;
    },
    run(sql, params = []) {
        const stmt = getDb().prepare(sql);
        return stmt.run(...params);
    },
    exec(sql) {
        return getDb().exec(sql);
    },
    transaction(callback) {
        const rawDb = getDb();
        rawDb.exec('BEGIN TRANSACTION;');
        try {
            const result = callback(db);
            rawDb.exec('COMMIT;');
            return result;
        } catch (error) {
            rawDb.exec('ROLLBACK;');
            throw error;
        }
    }
};

module.exports = db;
