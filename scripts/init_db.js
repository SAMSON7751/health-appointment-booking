const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

async function runPostgres(db) {
  const sqlPath = path.resolve(__dirname, '..', 'sql', 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('Applying Postgres schema...');
  await db.pool.query(sql);
}

function runSqlite() {
  const sqlite3 = require('sqlite3').verbose();
  const sqlPath = path.resolve(__dirname, '..', 'sql', 'schema.sqlite.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const dbFile = process.env.SQLITE_FILE || path.resolve(__dirname, '..', 'data', 'healthdb.sqlite');
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log('Initializing SQLite DB at', dbFile);
  const db = new sqlite3.Database(dbFile);
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      db.close();
      resolve();
    });
  });
}

async function main() {
  try {
    const useSqlite = process.env.USE_SQLITE === 'true' || (process.env.DATABASE_URL || '').startsWith('sqlite:');
    if (useSqlite) {
      await runSqlite();
      console.log('SQLite schema applied successfully.');
      process.exit(0);
    } else {
        // If using JSON fallback, create initial JSON file
        if (process.env.USE_JSON === 'true' || !process.env.DATABASE_URL) {
          const path = require('path');
          const fs = require('fs');
          const jsonFile = process.env.JSON_FILE || path.resolve(__dirname, '..', 'data', 'healthdb.json');
          const dir = path.dirname(jsonFile);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          if (!fs.existsSync(jsonFile)) {
            const initial = {
              users: [
                { id: 1, name: 'Dr Alice', email: 'alice@clinic.test', password_hash: 'placeholder', role: 'doctor', created_at: new Date().toISOString() },
                { id: 2, name: 'Bob Patient', email: 'bob@patient.test', password_hash: 'placeholder', role: 'patient', created_at: new Date().toISOString() },
              ],
              appointments: [],
            };
            fs.writeFileSync(jsonFile, JSON.stringify(initial, null, 2));
          }
          console.log('JSON DB initialized at', jsonFile);
          process.exit(0);
        }
        const db = require('../src/db');
        await runPostgres(db);
        console.log('Postgres schema applied successfully.');
      process.exit(0);
    }
  } catch (err) {
    console.error('Failed to initialize DB:', err);
    process.exit(1);
  }
}

main();
