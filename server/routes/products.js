const express     = require('express');
const db          = require('../db');
const verifyToken = require('../middleware/auth');
const router      = express.Router();

// ── GET /api/products ── Get all products ────────────
router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ── GET /api/products/:id ── Get single product ──────
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM products WHERE product_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
});

// ── POST /api/products/search ── Log search + return results ─
router.post('/search', verifyToken, (req, res) => {
  const { query } = req.body;
  const userId = req.user.userId;

  const searchQuery = `%${query}%`;
  db.query(
    'SELECT * FROM products WHERE product_name LIKE ?',
    [searchQuery],
    (err, products) => {
      if (err) return res.status(500).json({ error: err.message });

      // Log each result into searches table
      if (products.length > 0) {
        const values = products.map(p => [userId, p.product_id]);
        db.query('INSERT INTO searches (user_id, product_id) VALUES ?', [values], () => {});
      }

      res.json(products);
    }
  );
});

module.exports = router;