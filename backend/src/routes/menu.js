const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const items = await MenuItem.find({
      restaurant: req.params.restaurantId,
      available: true,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
