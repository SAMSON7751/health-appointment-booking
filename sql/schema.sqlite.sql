-- SQLite schema for Health Appointment Booking System (fallback demo)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample doctor and patient
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES (1, 'Dr Alice', 'alice@clinic.test', 'placeholder', 'doctor');
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES (2, 'Bob Patient', 'bob@patient.test', 'placeholder', 'patient');
