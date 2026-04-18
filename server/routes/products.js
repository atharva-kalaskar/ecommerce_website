const express = require('express');
const db      = require('../db');
const router  = express.Router();

// ── GET /api/products ── Get all products with order count ────
// Usage: GET /api/products         → all products
// Usage: GET /api/products?q=phone → search using JOIN
router.get('/', (req, res) => {
  const { q } = req.query;

  if (q && q.trim() !== '') {
    // JOIN products with order_items to get search results + times_ordered
    const sql = `
      SELECT DISTINCT p.*
      FROM products p
      LEFT JOIN order_items oi ON p.product_id = oi.product_id
      WHERE p.product_name LIKE ?
    `;
    db.query(sql, [`%${q}%`], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  } else {
    const sql = `
      SELECT DISTINCT p.*
      FROM products p
      LEFT JOIN order_items oi ON p.product_id = oi.product_id
    `;
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  }
});

// ── GET /api/products/:id ── Get single product ──────
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM products WHERE product_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
});

module.exports = router;