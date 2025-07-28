const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize SQLite database
const dbPath = path.join('/tmp', 'taskflow.db');
const db = new sqlite3.Database(dbPath);

// Initialize tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
});

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }

    // Find user
    db.get(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, username],
        async (err, user) => {
            if (err) {
                res.status(500).json({ error: 'Login failed' });
                return;
            }

            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            try {
                // Verify password
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    res.status(401).json({ error: 'Invalid credentials' });
                    return;
                }

                // Create session
                const sessionId = uuidv4();
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                db.run(
                    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
                    [sessionId, user.id, expiresAt.toISOString()],
                    (err) => {
                        if (err) {
                            res.status(500).json({ error: 'Login failed' });
                            return;
                        }

                        // Set session cookie
                        res.setHeader('Set-Cookie', `session=${sessionId}; HttpOnly; SameSite=Lax; Max-Age=86400; Path=/`);
                        
                        res.status(200).json({
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            message: 'Login successful'
                        });
                    }
                );
            } catch (error) {
                res.status(500).json({ error: 'Login failed' });
            }
        }
    );
};