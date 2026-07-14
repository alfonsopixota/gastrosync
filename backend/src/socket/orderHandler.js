const { z } = require('zod');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const { createOrderSchema, updateItemSchema, tableStatusSchema } = require('../validation/schemas');
const { sanitizeError } = require('../utils/errors');

const setupOrderSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on('join:restaurant', (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`Socket ${socket.id} unido a restaurant:${restaurantId}`);
    });

    socket.on('order:create', async (data) => {
      try {
        const parsed = createOrderSchema.parse(data);

        const menuItems = await MenuItem.find({
          _id: { $in: parsed.items.map((i) => i.menuItem) },
          restaurant: parsed.restaurant,
        });

        if (menuItems.length !== parsed.items.length) {
          return socket.emit('error', { message: 'Algún item del menú no existe o no pertenece a este restaurante' });
        }

        const menuItemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

        let total = 0;
        const items = parsed.items.map((item) => {
          const dbItem = menuItemMap.get(item.menuItem);
          const price = dbItem.price;
          total += price * item.quantity;
          return { ...item, price, name: dbItem.name };
        });

        const order = await Order.create({
          restaurant: parsed.restaurant,
          table: parsed.table,
          tableNumber: parsed.tableNumber,
          items,
          total,
          waiter: parsed.waiter,
          notes: parsed.notes,
        });

        const populated = await Order.findById(order._id).populate('items.menuItem');
        io.to(`restaurant:${parsed.restaurant}`).emit('order:new', populated);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return socket.emit('error', { message: 'Datos inválidos', errors: err.issues });
        }
        socket.emit('error', { message: sanitizeError(err) });
      }
    });

    socket.on('order:updateItem', async (data) => {
      try {
        const parsed = updateItemSchema.parse(data);
        const order = await Order.findOneAndUpdate(
          { _id: parsed.orderId, 'items._id': parsed.itemId },
          { $set: { 'items.$.status': parsed.status } },
          { new: true }
        ).populate('items.menuItem');
        if (order) {
          io.to(`restaurant:${order.restaurant}`).emit('order:updated', order);
        }
      } catch (err) {
        if (err instanceof z.ZodError) {
          return socket.emit('error', { message: 'Datos inválidos', errors: err.issues });
        }
        socket.emit('error', { message: sanitizeError(err) });
      }
    });

    socket.on('table:updateStatus', async (data) => {
      try {
        const parsed = tableStatusSchema.parse(data);
        const table = await Table.findByIdAndUpdate(
          parsed.tableId,
          { status: parsed.status },
          { new: true }
        );
        if (table) {
          io.to(`restaurant:${table.restaurant}`).emit('table:updated', table);
        }
      } catch (err) {
        if (err instanceof z.ZodError) {
          return socket.emit('error', { message: 'Datos inválidos', errors: err.issues });
        }
        socket.emit('error', { message: sanitizeError(err) });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
};

module.exports = setupOrderSocket;
