const config = require('../config');

const sanitizeError = (err) => {
  if (config.isProduction) {
    return 'Error interno del servidor';
  }
  return err.message || 'Error desconocido';
};

module.exports = { sanitizeError };
