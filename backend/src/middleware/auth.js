const jwt = require('jsonwebtoken');
const config = require('../config');

const JWT_SECRET = config.jwtSecret;

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
};

const socketAuthenticate = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Token de autenticación requerido'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Token inválido'));
  }
};

module.exports = { authenticate, authorize, socketAuthenticate, JWT_SECRET };
