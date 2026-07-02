const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  address: String,
  phone: String,
  config: {
    darkModeKitchen: { type: Boolean, default: true },
    language: { type: String, default: 'es' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
