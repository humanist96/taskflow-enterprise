const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database setup - use unified db module
const db = require('./database/db');

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'taskflow-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
};

// Use PostgreSQL session store in production
if (process.env.DATABASE_URL) {
    const pgSession = require('connect-pg-simple')(session);
    sessionConfig.store = new pgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true
    });
}

app.use(session(sessionConfig));

// Serve static files in all environments
app.use(express.static(__dirname));

// Initialize database schema
function initializeDatabase() {
    const schemaFile = process.env.DATABASE_URL ? 'schema-pg.sql' : 'schema.sql';
    const schemaPath = path.join(__dirname, 'database', schemaFile);
    
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error initializing database:', err);
            } else {
                console.log('Database schema initialized');
            }
        });
    }
}

// Initialize database on startup
initializeDatabase();

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const stmt = db.prepare(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `);
        
        stmt.run(username, email, hashedPassword, function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Username or email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            
            req.session.userId = this.lastID;
            res.json({ 
                id: this.lastID, 
                username, 
                email,
                message: 'Registration successful' 
            });
        });
        
        stmt.finalize();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, username],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            req.session.userId = user.id;
            res.json({ 
                id: user.id, 
                username: user.username, 
                email: user.email,
                theme: user.theme_preference 
            });
        }
    );
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    db.get(
        'SELECT id, username, email, theme_preference FROM users WHERE id = ?',
        [req.session.userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(user);
        }
    );
});

// Team Collaboration Routes
app.post('/api/teams', requireAuth, (req, res) => {
    const { name, description } = req.body;
    const owner_id = req.session.userId;

    db.run(
        'INSERT INTO teams (name, description, owner_id) VALUES (?, ?, ?)',
        [name, description, owner_id],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            const teamId = this.lastID;
            
            // Add owner as admin member
            db.run(
                'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
                [teamId, owner_id, 'admin'],
                (err) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    
                    res.json({ id: teamId, name, description, owner_id });
                }
            );
        }
    );
});

app.get('/api/teams', requireAuth, (req, res) => {
    db.all(
        `SELECT t.*, tm.role FROM teams t
         JOIN team_members tm ON t.id = tm.team_id
         WHERE tm.user_id = ?`,
        [req.session.userId],
        (err, teams) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json(teams);
        }
    );
});

app.get('/api/teams/:teamId/members', requireAuth, (req, res) => {
    const { teamId } = req.params;
    
    db.all(
        `SELECT u.id, u.username, u.email, tm.role, tm.joined_at
         FROM team_members tm
         JOIN users u ON tm.user_id = u.id
         WHERE tm.team_id = ?`,
        [teamId],
        (err, members) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json(members);
        }
    );
});

app.post('/api/teams/:teamId/invite', requireAuth, (req, res) => {
    const { teamId } = req.params;
    const { email, role = 'member' } = req.body;
    
    // Find user by email
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Add to team
        db.run(
            'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
            [teamId, user.id, role],
            (err) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                res.json({ message: 'User invited successfully' });
            }
        );
    });
});

app.post('/api/tasks/:taskId/assign', requireAuth, (req, res) => {
    const { taskId } = req.params;
    const { user_id } = req.body;
    
    db.run(
        'INSERT INTO task_assignments (task_id, user_id, assigned_by) VALUES (?, ?, ?)',
        [taskId, user_id, req.session.userId],
        (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ message: 'Task assigned successfully' });
        }
    );
});

app.get('/api/tasks/:taskId/comments', requireAuth, (req, res) => {
    const { taskId } = req.params;
    
    db.all(
        `SELECT c.*, u.username
         FROM task_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.task_id = ?
         ORDER BY c.created_at DESC`,
        [taskId],
        (err, comments) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json(comments);
        }
    );
});

app.post('/api/tasks/:taskId/comments', requireAuth, (req, res) => {
    const { taskId } = req.params;
    const { content } = req.body;
    
    db.run(
        'INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)',
        [taskId, req.session.userId, content],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            // Get user info for response
            db.get(
                'SELECT username FROM users WHERE id = ?',
                [req.session.userId],
                (err, user) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    
                    res.json({
                        id: this.lastID,
                        task_id: taskId,
                        user_id: req.session.userId,
                        username: user.username,
                        content,
                        created_at: new Date().toISOString()
                    });
                }
            );
        }
    );
});

// Task routes
app.get('/api/tasks', requireAuth, (req, res) => {
    const { status, category, priority, search } = req.query;
    let query = `
        SELECT t.*, c.name as category_name, c.icon as category_icon,
               GROUP_CONCAT(tg.name) as tags
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN task_tags tt ON t.id = tt.task_id
        LEFT JOIN tags tg ON tt.tag_id = tg.id
        WHERE t.user_id = ? AND t.is_deleted = 0
    `;
    
    const params = [req.session.userId];
    
    if (status) {
        query += ' AND t.status = ?';
        params.push(status);
    }
    
    if (category) {
        query += ' AND t.category_id = ?';
        params.push(category);
    }
    
    if (priority) {
        query += ' AND t.priority = ?';
        params.push(priority);
    }
    
    if (search) {
        query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' GROUP BY t.id ORDER BY t.position, t.created_at DESC';
    
    db.all(query, params, (err, tasks) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // Parse tags
        tasks = tasks.map(task => ({
            ...task,
            tags: task.tags ? task.tags.split(',') : []
        }));
        
        res.json(tasks);
    });
});

app.post('/api/tasks', requireAuth, (req, res) => {
    const { title, description, priority, category_id, due_date, tags } = req.body;
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Insert task
        const stmt = db.prepare(`
            INSERT INTO tasks (user_id, title, description, priority, category_id, due_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            req.session.userId,
            title,
            description,
            priority || 'medium',
            category_id,
            due_date,
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }
                
                const taskId = this.lastID;
                
                // Handle tags
                if (tags && tags.length > 0) {
                    const tagPromises = tags.map(tagName => {
                        return new Promise((resolve, reject) => {
                            // Insert or get tag
                            db.run(
                                'INSERT OR IGNORE INTO tags (name, user_id) VALUES (?, ?)',
                                [tagName, req.session.userId],
                                function() {
                                    db.get(
                                        'SELECT id FROM tags WHERE name = ? AND user_id = ?',
                                        [tagName, req.session.userId],
                                        (err, tag) => {
                                            if (err) return reject(err);
                                            
                                            // Link tag to task
                                            db.run(
                                                'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
                                                [taskId, tag.id],
                                                (err) => {
                                                    if (err) return reject(err);
                                                    resolve();
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        });
                    });
                    
                    Promise.all(tagPromises)
                        .then(() => {
                            db.run('COMMIT');
                            
                            // Log activity
                            db.run(
                                'INSERT INTO activity_logs (user_id, task_id, action, details) VALUES (?, ?, ?, ?)',
                                [req.session.userId, taskId, 'created', `Task "${title}" created`]
                            );
                            
                            res.json({ id: taskId, message: 'Task created successfully' });
                        })
                        .catch(err => {
                            db.run('ROLLBACK');
                            res.status(500).json({ error: err.message });
                        });
                } else {
                    db.run('COMMIT');
                    res.json({ id: taskId, message: 'Task created successfully' });
                }
            }
        );
        
        stmt.finalize();
    });
});

app.get('/api/tasks/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    
    db.get(
        `SELECT t.*, c.name as category_name, c.icon as category_icon,
                GROUP_CONCAT(DISTINCT tg.name) as tags,
                GROUP_CONCAT(DISTINCT u.username) as assignees
         FROM tasks t
         LEFT JOIN categories c ON t.category_id = c.id
         LEFT JOIN task_tags tt ON t.id = tt.task_id
         LEFT JOIN tags tg ON tt.tag_id = tg.id
         LEFT JOIN task_assignments ta ON t.id = ta.task_id
         LEFT JOIN users u ON ta.user_id = u.id
         WHERE t.id = ? AND t.user_id = ? AND t.is_deleted = 0
         GROUP BY t.id`,
        [id, req.session.userId],
        (err, task) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
            
            // Parse tags and assignees
            task.tags = task.tags ? task.tags.split(',') : [];
            task.assignees = task.assignees ? task.assignees.split(',').map(username => ({ username })) : [];
            
            res.json(task);
        }
    );
});

app.put('/api/tasks/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    // Build update query dynamically
    const allowedFields = ['title', 'description', 'priority', 'category_id', 'status', 'due_date', 'position'];
    const updateFields = [];
    const values = [];
    
    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            updateFields.push(`${field} = ?`);
            values.push(updates[field]);
        }
    }
    
    if (updates.status === 'completed') {
        updateFields.push('completed_at = CURRENT_TIMESTAMP');
    }
    
    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    values.push(req.session.userId, id);
    
    const query = `
        UPDATE tasks 
        SET ${updateFields.join(', ')}
        WHERE user_id = ? AND id = ?
    `;
    
    db.run(query, values, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Log activity
        db.run(
            'INSERT INTO activity_logs (user_id, task_id, action, details) VALUES (?, ?, ?, ?)',
            [req.session.userId, id, 'updated', JSON.stringify(updates)]
        );
        
        res.json({ message: 'Task updated successfully' });
    });
});

app.delete('/api/tasks/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    
    db.run(
        'UPDATE tasks SET is_deleted = 1 WHERE user_id = ? AND id = ?',
        [req.session.userId, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            
            // Log activity
            db.run(
                'INSERT INTO activity_logs (user_id, task_id, action, details) VALUES (?, ?, ?, ?)',
                [req.session.userId, id, 'deleted', 'Task moved to trash']
            );
            
            res.json({ message: 'Task deleted successfully' });
        }
    );
});

// Statistics routes
app.get('/api/stats/overview', requireAuth, (req, res) => {
    const userId = req.session.userId;
    
    db.serialize(() => {
        const stats = {};
        
        // Get task counts
        db.get(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as today
            FROM tasks 
            WHERE user_id = ? AND is_deleted = 0`,
            [userId],
            (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.tasks = row;
                
                // Get priority distribution
                db.all(
                    `SELECT priority, COUNT(*) as count 
                    FROM tasks 
                    WHERE user_id = ? AND is_deleted = 0 
                    GROUP BY priority`,
                    [userId],
                    (err, rows) => {
                        if (err) return res.status(500).json({ error: err.message });
                        stats.priorities = rows;
                        
                        // Get recent activity
                        db.all(
                            `SELECT * FROM activity_logs 
                            WHERE user_id = ? 
                            ORDER BY created_at DESC 
                            LIMIT 10`,
                            [userId],
                            (err, rows) => {
                                if (err) return res.status(500).json({ error: err.message });
                                stats.recentActivity = rows;
                                
                                res.json(stats);
                            }
                        );
                    }
                );
            }
        );
    });
});

// Categories routes
app.get('/api/categories', requireAuth, (req, res) => {
    db.all(
        'SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL',
        [req.session.userId],
        (err, categories) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(categories);
        }
    );
});

// Tags routes
app.get('/api/tags', requireAuth, (req, res) => {
    db.all(
        'SELECT * FROM tags WHERE user_id = ? ORDER BY name',
        [req.session.userId],
        (err, tags) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(tags);
        }
    );
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route for client-side routing
// This must be the last route
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    
    // Check if the requested file exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        // Default to index.html for client-side routing
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`TaskFlow Pro server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});