const express = require('express');
const MenuItem = require('../models/MenuItem');
const { authenticate, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const { sanitizeError } = require('../utils/errors');

const router = express.Router();

router.use(authenticate);

router.get('/restaurant/:restaurantId', validateObjectId('restaurantId'), authorize('admin', 'waiter', 'kitchen'), async (req, res) => {
  try {
    if (req.user.restaurant !== req.params.restaurantId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes acceso a este restaurante' });
    }

    const items = await MenuItem.find({
      restaurant: req.params.restaurantId,
      available: true,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: sanitizeError(err) });
  }
});

module.exports = router;
