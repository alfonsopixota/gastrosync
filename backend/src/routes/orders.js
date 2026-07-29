const { Router } = require('express');
const Order = require('../models/Order');
const { authenticate, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { sanitizeError } = require('../utils/errors');

const router = Router();

router.use(authenticate);

router.get('/restaurant/:restaurantId', validateObjectId('restaurantId'), authorize('admin', 'waiter', 'kitchen'), async (req, res) => {
  try {
    if (req.user.restaurant !== req.params.restaurantId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes acceso a este restaurante' });
    }

    const orders = await Order.find({
      restaurant: req.params.restaurantId,
      status: { $in: ['open', 'in_progress'] },
    }).populate('items.menuItem').sort('-createdAt').lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: sanitizeError(err) });
  }
});

router.get('/restaurant/:restaurantId/history', validateObjectId('restaurantId'), authorize('admin', 'waiter'), async (req, res) => {
  try {
    if (req.user.restaurant !== req.params.restaurantId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes acceso a este restaurante' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({
        restaurant: req.params.restaurantId,
        status: 'completed',
      }).populate('items.menuItem').sort('-createdAt').skip(skip).limit(limit).lean(),
      Order.countDocuments({
        restaurant: req.params.restaurantId,
        status: 'completed',
      }),
    ]);

    res.json({ orders, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: sanitizeError(err) });
  }
});

module.exports = router;
