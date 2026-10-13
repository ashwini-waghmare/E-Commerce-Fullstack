const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

function createToken(userId) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('replace_')) {
    const error = new Error('Authentication is not configured. Set JWT_SECRET in backend/.env.');
    error.status = 503;
    throw error;
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `goodform_token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${secure}`);
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

router.post('/register', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ success: false, message: 'Enter a name, a valid email, and a password of 8 to 72 characters.' });
  }

  try {
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );
    const user = { id: result.insertId, name, email };
    setAuthCookie(res, createToken(user.id));
    return res.status(201).json({ success: true, user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
    }
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Could not create your account.' });
  }
});

router.post('/login', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ success: false, message: 'Enter a valid email and password.' });
  }

  try {
    const [rows] = await pool.execute('SELECT id, name, email, password FROM users WHERE email = ?', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect.' });
    }
    setAuthCookie(res, createToken(rows[0].id));
    return res.status(200).json({ success: true, user: publicUser(rows[0]) });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Could not sign in.' });
  }
});

router.post('/logout', (req, res) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `goodform_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`);
  return res.json({ success: true });
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email FROM users WHERE id = ?', [req.userId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Account not found.' });
    return res.json({ success: true, user: publicUser(rows[0]) });
  } catch {
    return res.status(500).json({ success: false, message: 'Could not load your account.' });
  }
});

module.exports = router;