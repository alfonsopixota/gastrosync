const { Router } = require('express');
const { tableStatusSchema } = require('../validation/schemas');
const { authenticate, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const asyncHandler = require('../middleware/asyncHandler');
const tableService = require('../services/tableService');

const router = Router();

router.use(authenticate);

router.get(
  '/restaurant/:restaurantId',
  validateObjectId('restaurantId'),
  authorize('admin', 'waiter', 'kitchen'),
  asyncHandler(async (req, res) => {
    const tables = await tableService.getTablesByRestaurant(req.params.restaurantId);
    res.json(tables);
  })
);

router.put(
  '/:tableId/status',
  validateObjectId('tableId'),
  authorize('admin', 'waiter'),
  asyncHandler(async (req, res) => {
    const parsed = tableStatusSchema.parse({
      tableId: req.params.tableId,
      status: req.body.status,
    });
    const table = await tableService.updateTableStatus(parsed.tableId, parsed.status);
    res.json(table);
  })
);

module.exports = router;
