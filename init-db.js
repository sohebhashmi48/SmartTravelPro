// Database initialization script
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'smarttravel.db');
const sqlPath = path.join(process.cwd(), 'create_database.sql');

console.log('Initializing SQLite database...');

// Create database
const db = new Database(dbPath);

// Read and execute SQL script
const sql = fs.readFileSync(sqlPath, 'utf8');
const statements = sql.split(';').filter(stmt => stmt.trim());

statements.forEach(statement => {
  if (statement.trim()) {
    try {
      db.exec(statement);
    } catch (error) {
      console.error('Error executing statement:', statement);
      console.error(error);
    }
  }
});

console.log('Database initialized successfully!');
console.log(`Database file created at: ${dbPath}`);

db.close();
