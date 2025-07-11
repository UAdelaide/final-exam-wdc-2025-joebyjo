const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (dummy version)
router.post('/login', async (req, res) => {
  // changed from requiring email to requiring username
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]); // updated query to search by username instead of email

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // added user object to sessions
    req.session.user = rows[0];
    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET all dogs of current user
router.get('/dogs', async (req, res) => {
  try {

    if (!req.session.user || !req.session.user.user_id) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const [rows] = await db.query(`
      SELECT dog_id, name FROM Dogs D
      INNER JOIN Users U on U.user_id=D.owner_id
      WHERE D.owner_id = ?
    `,[req.session.user.user_id]);
    res.json(rows);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// added logout route
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        // clearing cookies to logout user
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logged out successfuly'});
    });
});



module.exports = router;