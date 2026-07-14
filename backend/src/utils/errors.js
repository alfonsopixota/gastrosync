const sanitizeError = (err) => {
  if (process.env.NODE_ENV === 'production') {
    return 'Error interno del servidor';
  }
  return err.message || 'Error desconocido';
};

module.exports = { sanitizeError };
