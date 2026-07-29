const MenuItem = require('../models/MenuItem');

const getAvailableMenuItems = async (restaurantId) => {
  return MenuItem.find({
    restaurant: restaurantId,
    available: true,
  });
};

module.exports = {
  getAvailableMenuItems,
};
