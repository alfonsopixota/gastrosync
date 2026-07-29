const mongoose = require('mongoose');

const validateObjectId = (...paramNames) => {
  return (req, res, next) => {
    for (const param of paramNames) {
      if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
        return res.status(400).json({ error: `El parámetro "${param}" no es un ID válido` });
      }
    }
    next();
  };
};

module.exports = validateObjectId;
