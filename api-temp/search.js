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

    const { q } = req.query;

    if (!q) {
        res.status(400).json({ error: 'Search query is required' });
        return;
    }

    try {
        // Search tasks
        const tasks = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM tasks 
                 WHERE title LIKE ? OR description LIKE ? OR category LIKE ?
                 ORDER BY created_at DESC`,
                [`%${q}%`, `%${q}%`, `%${q}%`],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};