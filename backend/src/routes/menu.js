const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const checkRestaurantAccess = require('../middleware/checkRestaurantAccess');
const asyncHandler = require('../middleware/asyncHandler');
const menuService = require('../services/menuService');

const router = Router();

router.use(authenticate);

router.get(
  '/restaurant/:restaurantId',
  validateObjectId('restaurantId'),
  authorize('admin', 'waiter', 'kitchen'),
  checkRestaurantAccess('restaurantId'),
  asyncHandler(async (req, res) => {
    const items = await menuService.getAvailableMenuItems(req.params.restaurantId);
    res.json(items);
  })
);

module.exports = router;
