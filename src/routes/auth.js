const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('valid email required'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 chars'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    try {
      if (db.json) {
        const user = await db.insert('users', { name, email, password_hash: hashed, role: role || 'patient', created_at: new Date().toISOString() });
        res.status(201).json({ user });
      } else {
        const result = await db.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
          [name, email, hashed, role || 'patient']
        );
        const user = result.rows[0];
        res.status(201).json({ user });
      }
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

// Login
router.post(
  '/login',
  [body('email').isEmail().withMessage('valid email required'), body('password').notEmpty().withMessage('password required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      let user;
      if (db.json) {
        const rows = await db.find('users', (r) => r.email === email);
        user = rows[0];
      } else {
        const result = await db.query('SELECT id, name, email, password_hash, role FROM users WHERE email=$1', [email]);
        user = result.rows[0];
      }
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

module.exports = router;
