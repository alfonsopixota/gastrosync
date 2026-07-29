const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const checkRestaurantAccess = require('../middleware/checkRestaurantAccess');
const asyncHandler = require('../middleware/asyncHandler');
const orderService = require('../services/orderService');

const router = Router();

router.use(authenticate);

router.get(
  '/restaurant/:restaurantId',
  validateObjectId('restaurantId'),
  authorize('admin', 'waiter', 'kitchen'),
  checkRestaurantAccess('restaurantId'),
  asyncHandler(async (req, res) => {
    const orders = await orderService.getActiveOrders(req.params.restaurantId);
    res.json(orders);
  })
);

router.get(
  '/restaurant/:restaurantId/history',
  validateObjectId('restaurantId'),
  authorize('admin', 'waiter'),
  checkRestaurantAccess('restaurantId'),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const result = await orderService.getOrderHistory(req.params.restaurantId, page, limit);
    res.json(result);
  })
);

module.exports = router;
