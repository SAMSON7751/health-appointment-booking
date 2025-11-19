const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Create appointment (patient books with a doctor)
router.post(
  '/',
  authenticate,
  [
    body('doctor_id').isInt().withMessage('doctor_id must be an integer'),
    body('starts_at').isISO8601().withMessage('starts_at must be an ISO8601 datetime'),
    body('ends_at').isISO8601().withMessage('ends_at must be an ISO8601 datetime'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { doctor_id, starts_at, ends_at, notes } = req.body;
    const patient_id = req.user && req.user.id;
    if (!patient_id) return res.status(401).json({ error: 'Not authenticated' });

    // Ensure starts < ends
    const s = new Date(starts_at);
    const e = new Date(ends_at);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return res.status(400).json({ error: 'starts_at must be before ends_at' });

    try {
      // Check doctor availability: no overlapping appointments for doctor
      if (db.json) {
        const appts = await db.getAll('appointments');
        const conflict = appts.find((a) => a.doctor_id === doctor_id && a.status === 'scheduled' && !(a.ends_at <= starts_at || a.starts_at >= ends_at));
        if (conflict) return res.status(409).json({ error: 'Doctor not available in that time range' });
        const appointment = await db.insert('appointments', { patient_id, doctor_id, starts_at, ends_at, notes: notes || null, status: 'scheduled', created_at: new Date().toISOString() });
        res.status(201).json({ appointment });
      } else {
        const conflict = await db.query(
          `SELECT 1 FROM appointments WHERE doctor_id=$1 AND status='scheduled' AND NOT (ends_at <= $2 OR starts_at >= $3) LIMIT 1`,
          [doctor_id, starts_at, ends_at]
        );
        if (conflict.rows.length) return res.status(409).json({ error: 'Doctor not available in that time range' });

        const result = await db.query(
          `INSERT INTO appointments (patient_id, doctor_id, starts_at, ends_at, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
          [patient_id, doctor_id, starts_at, ends_at, notes || null]
        );
        res.status(201).json({ appointment: result.rows[0] });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

// List appointments for authenticated user
router.get('/', authenticate, async (req, res) => {
  const { id, role } = req.user;
    try {
      if (db.json) {
        const appts = await db.getAll('appointments');
        const filtered = appts.filter((a) => (role === 'doctor' ? a.doctor_id === id : a.patient_id === id));
        filtered.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
        res.json({ appointments: filtered });
      } else {
        let result;
        if (role === 'doctor') {
          result = await db.query('SELECT * FROM appointments WHERE doctor_id=$1 ORDER BY starts_at', [id]);
        } else {
          result = await db.query('SELECT * FROM appointments WHERE patient_id=$1 ORDER BY starts_at', [id]);
        }
        res.json({ appointments: result.rows });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
});

// Cancel appointment (patient or doctor)
router.post('/:id/cancel', authenticate, async (req, res) => {
  const apptId = req.params.id;
  const user = req.user;
  try {
    if (db.json) {
      const rows = await db.find('appointments', (a) => String(a.id) === String(apptId));
      const appt = rows[0];
      if (!appt) return res.status(404).json({ error: 'Appointment not found' });
      if (user.role !== 'doctor' && user.id !== appt.patient_id) return res.status(403).json({ error: 'Not allowed' });
      await db.update('appointments', apptId, { status: 'cancelled' });
      res.json({ ok: true });
    } else {
      const cur = await db.query('SELECT * FROM appointments WHERE id=$1', [apptId]);
      const appt = cur.rows[0];
      if (!appt) return res.status(404).json({ error: 'Appointment not found' });
      if (user.role !== 'doctor' && user.id !== appt.patient_id) return res.status(403).json({ error: 'Not allowed' });
      await db.query('UPDATE appointments SET status=$1 WHERE id=$2', ['cancelled', apptId]);
      res.json({ ok: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
