const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();
const categoryRouter = express.Router();

function toProduct(row) {
  return {
    ...row,
    price: Number(row.price),
    discount_price: row.discount_price === null ? null : Number(row.discount_price),
    rating: Number(row.rating),
    review_count: Number(row.review_count),
    stock: Number(row.stock),
  };
}

router.get('/', async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
  const offset = (page - 1) * limit;
  const where = ['p.is_active = 1'];
  const values = [];
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim().slice(0, 120) : '';
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);

  if (search) {
    where.push('(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)');
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (category) {
    where.push('(c.slug = ? OR c.name = ?)');
    values.push(category, category);
  }
  if (req.query.minPrice !== undefined && Number.isFinite(minPrice) && minPrice >= 0) {
    where.push('COALESCE(p.discount_price, p.price) >= ?');
    values.push(minPrice);
  }
  if (req.query.maxPrice !== undefined && Number.isFinite(maxPrice) && maxPrice >= 0) {
    where.push('COALESCE(p.discount_price, p.price) <= ?');
    values.push(maxPrice);
  }

  const orderBy = {
    popular: 'p.review_count DESC, p.rating DESC',
    price_asc: 'COALESCE(p.discount_price, p.price) ASC',
    price_desc: 'COALESCE(p.discount_price, p.price) DESC',
    newest: 'p.created_at DESC',
  }[req.query.sort] || 'p.created_at DESC';
  const conditions = where.join(' AND ');

  try {
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id WHERE ${conditions}`,
      values
    );
    const [rows] = await pool.execute(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.discount_price, p.stock, p.brand, p.rating, p.review_count, c.name AS category, c.slug AS category_slug,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order, pi.id LIMIT 1) AS image
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE ${conditions} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );
    const total = Number(countRows[0].total);
    return res.json({ success: true, products: rows.map(toProduct), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch {
    return res.status(500).json({ success: false, message: 'Could not load products.' });
  }
});

router.get('/:idOrSlug', async (req, res) => {
  const value = req.params.idOrSlug;
  const condition = /^\d+$/.test(value) ? 'p.id = ?' : 'p.slug = ?';

  try {
    const [rows] = await pool.execute(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.discount_price, p.stock, p.brand, p.rating, p.review_count, c.name AS category, c.slug AS category_slug
       FROM products p JOIN categories c ON c.id = p.category_id WHERE ${condition} AND p.is_active = 1 LIMIT 1`,
      [value]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found.' });
    const [images] = await pool.execute('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order, id', [rows[0].id]);
    return res.json({ success: true, product: { ...toProduct(rows[0]), images: images.map((image) => image.image_url) } });
  } catch {
    return res.status(500).json({ success: false, message: 'Could not load this product.' });
  }
});

categoryRouter.get('/', async (req, res) => {
  try {
    const [categories] = await pool.execute(
      `SELECT c.id, c.name, c.slug, c.description, c.image, COUNT(p.id) AS product_count
       FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       GROUP BY c.id ORDER BY c.name`
    );
    return res.json({ success: true, categories });
  } catch {
    return res.status(500).json({ success: false, message: 'Could not load categories.' });
  }
});

module.exports = router;
module.exports.categoryRouter = categoryRouter;