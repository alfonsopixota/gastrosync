const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const AppError = require('../utils/AppError');

const getActiveOrders = async (restaurantId) => {
  return Order.find({
    restaurant: restaurantId,
    status: { $in: ['open', 'in_progress'] },
  })
    .populate('items.menuItem')
    .sort('-createdAt')
    .lean();
};

const getOrderHistory = async (restaurantId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({
      restaurant: restaurantId,
      status: 'completed',
    })
      .populate('items.menuItem')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({
      restaurant: restaurantId,
      status: 'completed',
    }),
  ]);

  return { orders, page, limit, total, pages: Math.ceil(total / limit) };
};

const createOrder = async ({ restaurant, table, tableNumber, items, waiter, notes }) => {
  const menuItems = await MenuItem.find({
    _id: { $in: items.map((i) => i.menuItem) },
    restaurant,
  });

  if (menuItems.length !== items.length) {
    throw new AppError('Algún item del menú no existe o no pertenece a este restaurante', 400);
  }

  const menuItemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

  let total = 0;
  const resolvedItems = items.map((item) => {
    const dbItem = menuItemMap.get(item.menuItem);
    const price = dbItem.price;
    total += price * item.quantity;
    return { ...item, price, name: dbItem.name };
  });

  const order = await Order.create({
    restaurant,
    table,
    tableNumber,
    items: resolvedItems,
    total,
    waiter,
    notes,
  });

  return Order.findById(order._id).populate('items.menuItem');
};

const updateItemStatus = async ({ orderId, itemId, status }) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, 'items._id': itemId },
    { $set: { 'items.$.status': status } },
    { new: true }
  ).populate('items.menuItem');

  return order;
};

module.exports = {
  getActiveOrders,
  getOrderHistory,
  createOrder,
  updateItemStatus,
};
