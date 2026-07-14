const express = require('express');
const { z } = require('zod');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

const restaurantIdSchema = z.object({
  restaurantId: z.string().min(1),
});

router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const parsed = restaurantIdSchema.parse(req.params);
    const items = await MenuItem.find({
      restaurant: parsed.restaurantId,
      available: true,
    });
    res.json(items);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', errors: err.issues });
    }
    res.status(500).json({ error: 'Error al obtener el menú' });
  }
});

module.exports = router;
