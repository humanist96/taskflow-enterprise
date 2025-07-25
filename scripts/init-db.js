const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database paths
const dbPath = path.join(__dirname, '..', 'database', 'taskflow.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

console.log('Initializing TaskFlow Pro Database...');

// Create database directory
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Created database directory');
}

// Initialize database
const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    
    console.log('Connected to SQLite database');
    
    try {
        // Read and execute schema
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        db.exec(schema, async (err) => {
            if (err) {
                console.error('Error executing schema:', err);
                process.exit(1);
            }
            
            console.log('Database schema created successfully');
            
            // Create demo user
            const demoPassword = await bcrypt.hash('demo123', 10);
            
            db.run(
                `INSERT OR IGNORE INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
                ['demo', 'demo@taskflow.com', demoPassword],
                function(err) {
                    if (err) {
                        console.error('Error creating demo user:', err);
                    } else if (this.changes > 0) {
                        console.log('Demo user created (username: demo, password: demo123)');
                        
                        // Add sample tasks for demo user
                        const userId = this.lastID;
                        const sampleTasks = [
                            {
                                title: '프로젝트 계획서 작성',
                                priority: 'high',
                                category_id: 1,
                                status: 'in_progress'
                            },
                            {
                                title: '팀 미팅 준비',
                                priority: 'medium',
                                category_id: 4,
                                status: 'pending'
                            },
                            {
                                title: '코드 리뷰 완료',
                                priority: 'high',
                                category_id: 1,
                                status: 'completed'
                            },
                            {
                                title: '운동 30분',
                                priority: 'low',
                                category_id: 2,
                                status: 'pending'
                            }
                        ];
                        
                        sampleTasks.forEach((task, index) => {
                            db.run(
                                `INSERT INTO tasks (user_id, title, priority, category_id, status, position) 
                                 VALUES (?, ?, ?, ?, ?, ?)`,
                                [userId, task.title, task.priority, task.category_id, task.status, index],
                                (err) => {
                                    if (err) {
                                        console.error('Error creating sample task:', err);
                                    }
                                }
                            );
                        });
                        
                        console.log('Sample tasks created');
                    } else {
                        console.log('Demo user already exists');
                    }
                    
                    // Close database
                    db.close((err) => {
                        if (err) {
                            console.error('Error closing database:', err);
                        } else {
                            console.log('\nDatabase initialization complete!');
                            console.log('You can now run: npm start');
                        }
                        process.exit(0);
                    });
                }
            );
        });
    } catch (error) {
        console.error('Initialization error:', error);
        process.exit(1);
    }
});