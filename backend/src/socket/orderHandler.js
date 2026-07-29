const mongoose = require('mongoose');
const { createOrderSchema, updateItemSchema, tableStatusSchema } = require('../validation/schemas');
const orderService = require('../services/orderService');
const tableService = require('../services/tableService');

const VALID_ROLES = {
  createOrder: ['admin', 'waiter'],
  updateItem: ['admin', 'kitchen'],
  updateTable: ['admin', 'waiter'],
};

const checkRole = (user, allowedRoles) => {
  return allowedRoles.includes(user.role);
};

const checkOwnership = (user, resourceRestaurant) => {
  return user.restaurant === resourceRestaurant || user.role === 'admin';
};

const setupOrderSocket = (io) => {
  io.on('connection', (socket) => {
    const user = socket.user;

    socket.on('join:restaurant', (restaurantId) => {
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return socket.emit('error', { message: 'ID de restaurante inválido' });
      }

      if (!checkOwnership(user, restaurantId)) {
        return socket.emit('error', { message: 'No tienes acceso a este restaurante' });
      }

      socket.join(`restaurant:${restaurantId}`);
    });

    socket.on('order:create', async (data) => {
      try {
        const parsed = createOrderSchema.parse(data);

        if (!checkRole(user, VALID_ROLES.createOrder)) {
          return socket.emit('error', { message: 'No tienes permiso para crear pedidos' });
        }

        if (!checkOwnership(user, parsed.restaurant)) {
          return socket.emit('error', { message: 'No puedes crear pedidos para otro restaurante' });
        }

        const populated = await orderService.createOrder({
          restaurant: parsed.restaurant,
          table: parsed.table,
          tableNumber: parsed.tableNumber,
          items: parsed.items,
          waiter: user.id,
          notes: parsed.notes,
        });

        io.to(`restaurant:${parsed.restaurant}`).emit('order:new', populated);
      } catch (err) {
        socket.emit('error', {
          message: err.isOperational ? err.message : 'Error al crear pedido',
          errors: err.issues || undefined,
        });
      }
    });

    socket.on('order:updateItem', async (data) => {
      try {
        const parsed = updateItemSchema.parse(data);

        if (!checkRole(user, VALID_ROLES.updateItem)) {
          return socket.emit('error', { message: 'No tienes permiso para actualizar items' });
        }

        const order = await orderService.updateItemStatus({
          orderId: parsed.orderId,
          itemId: parsed.itemId,
          status: parsed.status,
        });

        if (order && checkOwnership(user, order.restaurant.toString())) {
          io.to(`restaurant:${order.restaurant}`).emit('order:updated', order);
        }
      } catch (err) {
        socket.emit('error', {
          message: err.isOperational ? err.message : 'Error al actualizar item',
          errors: err.issues || undefined,
        });
      }
    });

    socket.on('table:updateStatus', async (data) => {
      try {
        const parsed = tableStatusSchema.parse(data);

        if (!checkRole(user, VALID_ROLES.updateTable)) {
          return socket.emit('error', { message: 'No tienes permiso para actualizar mesas' });
        }

        const table = await tableService.updateTableStatus(parsed.tableId, parsed.status);

        if (checkOwnership(user, table.restaurant.toString())) {
          io.to(`restaurant:${table.restaurant}`).emit('table:updated', table);
        }
      } catch (err) {
        socket.emit('error', {
          message: err.isOperational ? err.message : 'Error al actualizar mesa',
          errors: err.issues || undefined,
        });
      }
    });

    socket.on('disconnect', () => {});
  });
};

module.exports = setupOrderSocket;
