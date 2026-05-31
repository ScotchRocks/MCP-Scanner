import initSqlJs from 'sql.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DB_PATH = join(DATA_DIR, 'mcp-scanner.db');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

let db = null;

/**
 * Initialize the database (async — sql.js uses WASM)
 */
export async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing DB or create new one
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable WAL-style foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      stripe_customer_id TEXT,
      subscription_tier TEXT DEFAULT 'free',
      subscription_status TEXT DEFAULT 'inactive',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      endpoint TEXT NOT NULL,
      trust_score INTEGER NOT NULL,
      grade TEXT NOT NULL,
      checks_data TEXT NOT NULL,
      summary TEXT NOT NULL,
      is_ci BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      name TEXT DEFAULT 'default',
      is_active BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      last_used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS subscription_events (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      stripe_event_id TEXT UNIQUE,
      event_type TEXT NOT NULL,
      data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Save to disk
  saveDatabase();

  return db;
}

/**
 * Save database to disk
 */
export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }
}

/**
 * Get the database instance (must call initDatabase first)
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Run a query and return all results (convenience wrapper)
 */
export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Run a query and return first result
 */
export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Run a statement (INSERT/UPDATE/DELETE)
 */
export function run(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
  return { changes: db.getRowsModified() };
}

export default { initDatabase, saveDatabase, getDatabase, queryAll, queryOne, run };