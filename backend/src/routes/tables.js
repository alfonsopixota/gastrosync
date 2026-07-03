const { Router } = require('express');
const Table = require('../models/Table');
const { VALID_TABLE_STATUSES } = require('../validation/schemas');

const router = Router();

router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const tables = await Table.find({ restaurant: req.params.restaurantId }).sort('number');
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:tableId/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_TABLE_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const table = await Table.findByIdAndUpdate(
      req.params.tableId,
      { status },
      { new: true }
    );
    if (!table) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
