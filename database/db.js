// Database configuration for both SQLite (local) and PostgreSQL (production)
const path = require('path');

let db;

if (process.env.DATABASE_URL) {
    // Production - PostgreSQL
    console.log('Using PostgreSQL database');
    const { Pool } = require('pg');
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // PostgreSQL adapter to match SQLite interface
    db = {
        run: (query, params, callback) => {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            
            pool.query(query, params, (err, result) => {
                if (callback) {
                    callback.call({ 
                        lastID: result ? result.rows[0]?.id : null,
                        changes: result ? result.rowCount : 0
                    }, err);
                }
            });
        },
        
        get: (query, params, callback) => {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            
            pool.query(query, params, (err, result) => {
                if (callback) {
                    callback(err, result ? result.rows[0] : null);
                }
            });
        },
        
        all: (query, params, callback) => {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            
            pool.query(query, params, (err, result) => {
                if (callback) {
                    callback(err, result ? result.rows : []);
                }
            });
        },
        
        exec: (query, callback) => {
            pool.query(query, callback);
        },
        
        prepare: (query) => {
            return {
                run: (...args) => {
                    const callback = args[args.length - 1];
                    const params = args.slice(0, -1);
                    db.run(query, params, callback);
                },
                finalize: () => {}
            };
        },
        
        serialize: (callback) => {
            callback();
        },
        
        close: (callback) => {
            pool.end(callback);
        }
    };
} else {
    // Development - SQLite
    console.log('Using SQLite database');
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'taskflow.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening SQLite database:', err);
        } else {
            console.log('Connected to SQLite database');
        }
    });
}

module.exports = db;