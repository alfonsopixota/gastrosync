const Order = require('../models/Order');

const setupOrderSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Unirse a sala de un restaurante específico
    socket.on('join:restaurant', (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`Socket ${socket.id} unido a restaurant:${restaurantId}`);
    });

    // Nuevo pedido
    socket.on('order:create', async (data) => {
      try {
        const order = await Order.create(data);
        const populated = await Order.findById(order._id)
          .populate('items.menuItem');
        io.to(`restaurant:${data.restaurant}`).emit('order:new', populated);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Actualizar estado de un item del pedido
    socket.on('order:updateItem', async ({ orderId, itemId, status }) => {
      try {
        const order = await Order.findOneAndUpdate(
          { _id: orderId, 'items._id': itemId },
          { $set: { 'items.$.status': status } },
          { new: true }
        ).populate('items.menuItem');
        if (order) {
          io.to(`restaurant:${order.restaurant}`).emit('order:updated', order);
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
};

module.exports = setupOrderSocket;
