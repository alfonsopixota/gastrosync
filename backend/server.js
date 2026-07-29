require('dotenv').config();
const config = require('./src/config');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { socketAuthenticate } = require('./src/middleware/auth');
const AppError = require('./src/utils/AppError');
const authRoutes = require('./src/routes/auth');
const orderRoutes = require('./src/routes/orders');
const tableRoutes = require('./src/routes/tables');
const menuRoutes = require('./src/routes/menu');

function createApp() {
  const app = express();
  const CORS_ORIGIN = config.clientUrl;

  app.use(helmet());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas peticiones, intenta de nuevo más tarde' },
  });
  app.use('/api/', limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Demasiados intentos de autenticación' },
  });
  app.use('/api/auth/login', authLimiter);

  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json({ limit: '10kb' }));

  app.use('/api/auth', authRoutes);
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'GastroSync API' });
  });

  app.use('/api/orders', orderRoutes);
  app.use('/api/tables', tableRoutes);
  app.use('/api/menu', menuRoutes);

  app.use((err, _req, res, _next) => {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Datos inválidos',
        errors: err.issues,
      });
    }

    if (err.isOperational) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    console.error('Error no manejado:', err);
    res.status(500).json({
      error: config.isProduction ? 'Error interno del servidor' : err.message,
    });
  });

  return app;
}

const PORT = config.port;

if (require.main === module) {
  const connectDB = require('./src/config/db');
  const setupOrderSocket = require('./src/socket/orderHandler');
  const { Server } = require('socket.io');

  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
    },
  });

  io.use(socketAuthenticate);
  setupOrderSocket(io);

  connectDB().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`GastroSync backend corriendo en puerto ${PORT}`);
    });
  });
}

module.exports = { createApp };
