const Table = require('../models/Table');
const AppError = require('../utils/AppError');

const getTablesByRestaurant = async (restaurantId) => {
  return Table.find({ restaurant: restaurantId }).sort('number');
};

const updateTableStatus = async (tableId, status) => {
  const table = await Table.findByIdAndUpdate(
    tableId,
    { status },
    { new: true }
  );

  if (!table) {
    throw new AppError('Mesa no encontrada', 404);
  }

  return table;
};

module.exports = {
  getTablesByRestaurant,
  updateTableStatus,
};
