const express = require('express');
const { randomUUID } = require('node:crypto');
const { pool } = require('../config/db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.post('/', async (req, res) => {
  const items = req.body.items;
  const address = req.body.shippingAddress;
  const addressFields = ['fullName', 'phone', 'addressLine', 'city', 'state', 'postalCode', 'country'];

  if (!Array.isArray(items) || items.length < 1 || items.length > 50 || !address ||
      addressFields.some((field) => typeof address[field] !== 'string' || !address[field].trim() || address[field].length > 255) ||
      items.some((item) => !Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
    return res.status(400).json({ success: false, message: 'Check your shipping details and cart items.' });
  }

  const quantities = new Map();
  for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const orderItems = [];
    let subtotal = 0;

    for (const [productId, quantity] of quantities) {
      const [products] = await connection.execute(
        'SELECT id, name, COALESCE(discount_price, price) AS price, stock FROM products WHERE id = ? AND is_active = 1 FOR UPDATE',
        [productId]
      );
      if (!products.length || Number(products[0].stock) < quantity) {
        const error = new Error('One or more items are unavailable in the requested quantity.');
        error.status = 409;
        throw error;
      }
      const price = Number(products[0].price);
      subtotal += price * quantity;
      orderItems.push({ ...products[0], price, quantity });
    }

    const orderNumber = `GF-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const shippingAddress = JSON.stringify({
      fullName: address.fullName.trim(), phone: address.phone.trim(),
      addressLine: address.addressLine.trim(), city: address.city.trim(),
      state: address.state.trim(), postalCode: address.postalCode.trim(), country: address.country.trim(),
    });
    const [result] = await connection.execute(
      `INSERT INTO orders (user_id, order_number, subtotal, total, status, payment_status, shipping_address)
       VALUES (?, ?, ?, ?, 'pending', 'pending', ?)`,
      [req.userId, orderNumber, subtotal, subtotal, shippingAddress]
    );

    for (const item of orderItems) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?)',
        [result.insertId, item.id, item.name, item.quantity, item.price, item.price * item.quantity]
      );
      await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
    }

    await connection.commit();
    return res.status(201).json({
      success: true,
      order: { id: result.insertId, orderNumber, subtotal, total: subtotal, status: 'pending', paymentStatus: 'pending', items: orderItems.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })) },
      message: 'Order placed. Payment has not been collected; this store has no payment gateway configured.',
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Could not place your order.' });
  } finally {
    connection?.release();
  }
});

router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.execute(
      'SELECT id, order_number, subtotal, total, status, payment_status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    return res.json({ success: true, orders: orders.map((order) => ({ ...order, subtotal: Number(order.subtotal), total: Number(order.total) })) });
  } catch {
    return res.status(500).json({ success: false, message: 'Could not load your orders.' });
  }
});

router.get('/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ success: false, message: 'Order not found.' });
  try {
    const [orders] = await pool.execute(
      'SELECT id, order_number, subtotal, total, status, payment_status, shipping_address, created_at FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found.' });
    const [items] = await pool.execute('SELECT product_name, quantity, price, total FROM order_items WHERE order_id = ?', [orders[0].id]);
    const order = orders[0];
    return res.json({ success: true, order: { ...order, subtotal: Number(order.subtotal), total: Number(order.total), shipping_address: JSON.parse(order.shipping_address), items: items.map((item) => ({ ...item, price: Number(item.price), total: Number(item.total) })) } });
  } catch {
    return res.status(500).json({ success: false, message: 'Could not load this order.' });
  }
});

module.exports = router;