const { Router } = require('express');
const Table = require('../models/Table');
const { tableStatusSchema } = require('../validation/schemas');
const { sanitizeError } = require('../utils/errors');

const router = Router();

router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const tables = await Table.find({ restaurant: req.params.restaurantId }).sort('number');
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: sanitizeError(err) });
  }
});

router.put('/:tableId/status', async (req, res) => {
  try {
    const parsed = tableStatusSchema.parse({
      tableId: req.params.tableId,
      status: req.body.status,
    });
    const table = await Table.findByIdAndUpdate(
      parsed.tableId,
      { status: parsed.status },
      { new: true }
    );
    if (!table) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    res.json(table);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Datos inválidos', errors: err.issues });
    }
    res.status(500).json({ error: sanitizeError(err) });
  }
});

module.exports = router;
