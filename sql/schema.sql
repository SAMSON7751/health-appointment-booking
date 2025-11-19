-- SQL schema for Health Appointment Booking System
-- Run this in your Postgres database (psql -f sql/schema.sql)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient', -- patient or doctor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, cancelled, completed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sample doctor and patient
INSERT INTO users (name, email, password_hash, role)
VALUES ('Dr Alice', 'alice@clinic.test', 'placeholder', 'doctor')
ON CONFLICT DO NOTHING;

INSERT INTO users (name, email, password_hash, role)
VALUES ('Bob Patient', 'bob@patient.test', 'placeholder', 'patient')
ON CONFLICT DO NOTHING;
