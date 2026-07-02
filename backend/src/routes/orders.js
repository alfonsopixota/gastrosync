const { Router } = require('express');
const Order = require('../models/Order');

const router = Router();

// Obtener pedidos activos de un restaurante
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.params.restaurantId,
      status: { $in: ['open', 'in_progress'] },
    }).populate('items.menuItem').sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener historial de pedidos
router.get('/restaurant/:restaurantId/history', async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.params.restaurantId,
      status: 'completed',
    }).populate('items.menuItem').sort('-createdAt').limit(50);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
