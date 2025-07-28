const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize SQLite database
const dbPath = path.join('/tmp', 'taskflow.db');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        category TEXT,
        due_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER DEFAULT 1
    )`);
});

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { method } = req;

    switch (method) {
        case 'GET':
            // Get all tasks
            db.all("SELECT * FROM tasks ORDER BY created_at DESC", [], (err, rows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(200).json(rows);
            });
            break;

        case 'POST':
            // Create new task
            const { title, description, status, priority, category, due_date } = req.body;
            db.run(
                `INSERT INTO tasks (title, description, status, priority, category, due_date) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [title, description, status || 'pending', priority || 'medium', category, due_date],
                function(err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    res.status(201).json({ id: this.lastID, message: 'Task created successfully' });
                }
            );
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
};