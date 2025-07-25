const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Paths
const dbPath = path.join(__dirname, '..', 'database', 'taskflow.db');
const backupDir = path.join(__dirname, '..', 'backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `taskflow-backup-${timestamp}.sql`);

console.log('Starting database backup...');

// Open database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    
    console.log('Connected to database');
});

// Create backup file stream
const backupStream = fs.createWriteStream(backupPath);

// Write header
backupStream.write('-- TaskFlow Pro Database Backup\n');
backupStream.write(`-- Created: ${new Date().toISOString()}\n`);
backupStream.write('-- SQLite Database Dump\n\n');
backupStream.write('PRAGMA foreign_keys=OFF;\n');
backupStream.write('BEGIN TRANSACTION;\n\n');

// Tables to backup
const tables = [
    'users',
    'categories',
    'tasks',
    'tags',
    'task_tags',
    'activity_logs',
    'daily_statistics',
    'sessions'
];

let tableIndex = 0;

function backupTable() {
    if (tableIndex >= tables.length) {
        // Finish backup
        backupStream.write('\nCOMMIT;\n');
        backupStream.write('PRAGMA foreign_keys=ON;\n');
        backupStream.end();
        
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            }
            
            // Get file size
            const stats = fs.statSync(backupPath);
            const fileSizeInMB = (stats.size / 1024 / 1024).toFixed(2);
            
            console.log('\nBackup completed successfully!');
            console.log(`Backup file: ${backupPath}`);
            console.log(`File size: ${fileSizeInMB} MB`);
            
            // Clean old backups (keep last 10)
            cleanOldBackups();
        });
        return;
    }
    
    const table = tables[tableIndex];
    console.log(`Backing up table: ${table}`);
    
    // Get table schema
    db.get(
        `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`,
        [table],
        (err, row) => {
            if (err) {
                console.error(`Error getting schema for ${table}:`, err);
                tableIndex++;
                backupTable();
                return;
            }
            
            if (!row) {
                console.log(`Table ${table} not found, skipping...`);
                tableIndex++;
                backupTable();
                return;
            }
            
            // Write table creation SQL
            backupStream.write(`-- Table: ${table}\n`);
            backupStream.write(`DROP TABLE IF EXISTS ${table};\n`);
            backupStream.write(`${row.sql};\n\n`);
            
            // Get table data
            db.all(`SELECT * FROM ${table}`, (err, rows) => {
                if (err) {
                    console.error(`Error reading data from ${table}:`, err);
                    tableIndex++;
                    backupTable();
                    return;
                }
                
                if (rows.length > 0) {
                    // Write INSERT statements
                    rows.forEach(row => {
                        const columns = Object.keys(row).join(', ');
                        const values = Object.values(row).map(val => {
                            if (val === null) return 'NULL';
                            if (typeof val === 'number') return val;
                            if (typeof val === 'boolean') return val ? 1 : 0;
                            // Escape single quotes in strings
                            return `'${String(val).replace(/'/g, "''")}'`;
                        }).join(', ');
                        
                        backupStream.write(`INSERT INTO ${table} (${columns}) VALUES (${values});\n`);
                    });
                    backupStream.write('\n');
                }
                
                console.log(`  - Backed up ${rows.length} rows`);
                tableIndex++;
                backupTable();
            });
        }
    );
}

function cleanOldBackups() {
    fs.readdir(backupDir, (err, files) => {
        if (err) {
            console.error('Error reading backup directory:', err);
            return;
        }
        
        // Filter backup files and sort by date
        const backupFiles = files
            .filter(file => file.startsWith('taskflow-backup-') && file.endsWith('.sql'))
            .sort()
            .reverse();
        
        // Remove old backups (keep last 10)
        const filesToDelete = backupFiles.slice(10);
        
        filesToDelete.forEach(file => {
            const filePath = path.join(backupDir, file);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting old backup ${file}:`, err);
                } else {
                    console.log(`Deleted old backup: ${file}`);
                }
            });
        });
        
        if (filesToDelete.length > 0) {
            console.log(`Cleaned up ${filesToDelete.length} old backup(s)`);
        }
    });
}

// Start backup process
backupTable();