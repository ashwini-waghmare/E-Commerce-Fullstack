const express = require('express');
const { testConnection } = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'E-commerce API is running',
  });
});

router.get('/db', async (req, res) => {
  try {
    await testConnection();

    res.status(200).json({
      success: true,
      message: 'Database connection is working',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
    });
  }
});

module.exports = router;
