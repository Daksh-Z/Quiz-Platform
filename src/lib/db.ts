import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

import path from 'path';

// Vercel Serverless exclusively locks the root filesystem to Read-Only!
// We must aggressively re-route the SQLite database instance directly into the writable /tmp volume if deployed via Vercel
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel ? path.join('/tmp', 'quiz.db') : 'quiz.db';

const globalForDb = global as unknown as {
  db_v2: Database.Database | undefined
};

export const db = globalForDb.db_v2 ?? new Database(dbPath);

if (process.env.NODE_ENV !== 'production') globalForDb.db_v2 = db;

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      raw_password TEXT DEFAULT '',
      role TEXT DEFAULT 'USER'
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      time_limit_seconds INTEGER NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'Medium'
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      text TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON array
      correct_idx INTEGER NOT NULL,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      time_taken_seconds INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );
  `);

  // Live Schema Patch for raw_password column
  try {
    db.exec(`ALTER TABLE users ADD COLUMN raw_password TEXT DEFAULT ''`);
  } catch (e) {
    // Column already exists, safe to continue
  }

  // Seed Admin user
  const hash = bcrypt.hashSync("DakshZade123", 10);
  db.prepare("INSERT OR IGNORE INTO users (id, name, email, password_hash, raw_password, role) VALUES (?, ?, ?, ?, ?, ?)").run(
    'admin_1', 'System Admin', 'admin@quiz.com', hash, 'DakshZade123', 'ADMIN'
  );
}

// Ensure the db is initialized when this file is imported
initDb();
