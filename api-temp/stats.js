const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize SQLite database
const dbPath = path.join('/tmp', 'taskflow.db');
const db = new sqlite3.Database(dbPath);

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Get task statistics
        const stats = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as inProgress,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as highPriority,
                    SUM(CASE WHEN due_date < date('now') AND status != 'completed' THEN 1 ELSE 0 END) as overdue
                FROM tasks
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.status(200).json({
            total: stats.total || 0,
            completed: stats.completed || 0,
            inProgress: stats.inProgress || 0,
            pending: stats.pending || 0,
            highPriority: stats.highPriority || 0,
            overdue: stats.overdue || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};