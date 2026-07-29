const { Router } = require('express');
const Table = require('../models/Table');
const { tableStatusSchema } = require('../validation/schemas');
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

    const tables = await Table.find({ restaurant: req.params.restaurantId }).sort('number');
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: sanitizeError(err) });
  }
});

router.put('/:tableId/status', validateObjectId('tableId'), authorize('admin', 'waiter'), async (req, res) => {
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
    if (req.user.restaurant !== table.restaurant.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes acceso a esta mesa' });
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
