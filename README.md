# Health Appointment Booking System — Backend (Minimal Scaffold)

This repository contains a minimal Node.js + Express backend scaffold for a health appointment booking system using PostgreSQL.

Files created:
- `package.json` — dependencies and scripts
- `src/index.js` — server entrypoint
- `src/db/index.js` — Postgres connection wrapper (pg Pool)
- `src/middleware/auth.js` — JWT authentication middleware
- `src/routes/auth.js` — register & login
- `src/routes/appointments.js` — create/list/cancel appointments
- `sql/schema.sql` — SQL schema and sample inserts
- `.env.example` — environment variables example

Getting started
1. Copy `.env.example` to `.env` and set appropriate values (DATABASE_URL and JWT_SECRET).
2. Create the Postgres database referenced by `DATABASE_URL` and run the SQL schema:

   psql $DATABASE_URL -f sql/schema.sql

3. Install dependencies and start the server:

```powershell
npm install
npm run dev
```

HTTP API (examples)
- POST /api/auth/register { name, email, password, role } — create user
- POST /api/auth/login { email, password } — returns JWT
- POST /api/appointments — create appointment (Authorization: Bearer <token>) body: { doctor_id, starts_at, ends_at, notes }
- GET /api/appointments — list your appointments (doctor sees their incoming, patient sees their own)
- POST /api/appointments/:id/cancel — cancel an appointment (doctor or patient)

Notes & next steps
- Add proper migrations (e.g., node-pg-migrate, prisma, or knex)
- Add input validation (Joi or express-validator) and better error handling
- Add unit/integration tests and CI
- Frontend client to consume the API
