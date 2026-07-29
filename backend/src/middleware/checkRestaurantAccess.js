const AppError = require('../utils/AppError');

const checkRestaurantAccess = (paramName = 'restaurantId') => {
  return (req, res, next) => {
    const restaurantId = req.params[paramName] || req.body.restaurant;
    if (req.user.restaurant?.toString() !== restaurantId && req.user.role !== 'admin') {
      return next(new AppError('No tienes acceso a este restaurante', 403));
    }
    next();
  };
};

module.exports = checkRestaurantAccess;
