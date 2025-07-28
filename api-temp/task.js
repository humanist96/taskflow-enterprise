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

    const { method, query } = req;
    const taskId = query.id;

    if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
    }

    switch (method) {
        case 'GET':
            // Get single task
            db.get("SELECT * FROM tasks WHERE id = ?", [taskId], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                if (!row) {
                    res.status(404).json({ error: 'Task not found' });
                    return;
                }
                res.status(200).json(row);
            });
            break;

        case 'PUT':
            // Update task
            const { title, description, status, priority, category, due_date } = req.body;
            db.run(
                `UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, 
                 category = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [title, description, status, priority, category, due_date, taskId],
                function(err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    if (this.changes === 0) {
                        res.status(404).json({ error: 'Task not found' });
                        return;
                    }
                    res.status(200).json({ message: 'Task updated successfully' });
                }
            );
            break;

        case 'DELETE':
            // Delete task
            db.run("DELETE FROM tasks WHERE id = ?", [taskId], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: 'Task not found' });
                    return;
                }
                res.status(200).json({ message: 'Task deleted successfully' });
            });
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
};