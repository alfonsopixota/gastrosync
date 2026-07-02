const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: String,
  quantity: { type: Number, required: true, min: 1 },
  price: Number,
  notes: String,
  status: { type: String, enum: ['pending', 'preparing', 'ready', 'served'], default: 'pending' },
});

const orderSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  tableNumber: Number,
  items: [orderItemSchema],
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open' },
  total: { type: Number, default: 0 },
  waiter: String,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
