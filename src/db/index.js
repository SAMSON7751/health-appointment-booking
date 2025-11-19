const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const path = require('path');

if (process.env.USE_SQLITE === 'true' || (process.env.DATABASE_URL || '').startsWith('sqlite:')) {
  // SQLite adapter (not used in JSON fallback)
  try {
    const sqlite3 = require('sqlite3').verbose();
    const dbFile = process.env.SQLITE_FILE || path.resolve(__dirname, '..', 'data', 'healthdb.sqlite');
    const dir = path.dirname(dbFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const db = new sqlite3.Database(dbFile);
    const query = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve({ rows });
        });
      });
    };
    module.exports = {
      query,
      sqlite: true,
      _db: db,
    };
  } catch (err) {
    console.warn('sqlite3 not available:', err.message);
    // fallthrough to JSON fallback below
  }
}

// If DATABASE_URL is set, use Postgres
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
  };
} else if (process.env.USE_JSON === 'true' || !process.env.DATABASE_URL) {
  // JSON-file fallback adapter
  const jsonFile = process.env.JSON_FILE || path.resolve(__dirname, '..', 'data', 'healthdb.json');
  const dir = path.dirname(jsonFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Load or initialize
  if (!fs.existsSync(jsonFile)) {
    fs.writeFileSync(jsonFile, JSON.stringify({ users: [], appointments: [] }, null, 2));
  }

  function readDB() {
    const raw = fs.readFileSync(jsonFile, 'utf8');
    return JSON.parse(raw);
  }

  function writeDB(data) {
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
  }

  // Very small query API used by the app: we will implement helper methods used by routes.
  module.exports = {
    json: true,
    file: jsonFile,
    getAll: (table) => {
      const db = readDB();
      return Promise.resolve(db[table] || []);
    },
    insert: (table, item) => {
      const db = readDB();
      db[table] = db[table] || [];
      const id = (db[table].reduce((m, r) => Math.max(m, r.id || 0), 0) || 0) + 1;
      item.id = id;
      db[table].push(item);
      writeDB(db);
      return Promise.resolve(item);
    },
    find: (table, predicate) => {
      const db = readDB();
      const rows = (db[table] || []).filter(predicate);
      return Promise.resolve(rows);
    },
    update: (table, id, patch) => {
      const db = readDB();
      db[table] = db[table] || [];
      const idx = db[table].findIndex((r) => String(r.id) === String(id));
      if (idx === -1) return Promise.resolve(null);
      db[table][idx] = Object.assign({}, db[table][idx], patch);
      writeDB(db);
      return Promise.resolve(db[table][idx]);
    },
  };
}
