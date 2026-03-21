const express     = require('express');
const db          = require('../db');
const verifyToken = require('../middleware/auth');
const router      = express.Router();

// ── GET /api/address/:userId ── Get all addresses ────
router.get('/:userId', verifyToken, (req, res) => {
  db.query('SELECT * FROM address WHERE user_id = ?', [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ── POST /api/address ── Add new address ─────────────
router.post('/', verifyToken, (req, res) => {
  const { user_id, flat_no, building_name, city, state, pincode } = req.body;

  console.log('Address body received:', req.body); // for debugging

  if (!user_id || !city || !state || !pincode)
    return res.status(400).json({ error: 'user_id, city, state, pincode are required' });

  db.query(
    'INSERT INTO address (user_id, flat_no, building_name, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, flat_no, building_name, city, state, pincode],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Address added!', address_id: result.insertId });
    }
  );
});

// ── DELETE /api/address/:id ── Remove an address ─────
router.delete('/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM address WHERE address_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Address deleted!' });
  });
});

module.exports = router;