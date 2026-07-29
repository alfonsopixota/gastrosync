require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const { socketAuthenticate } = require('./src/middleware/auth');
const setupOrderSocket = require('./src/socket/orderHandler');
const authRoutes = require('./src/routes/auth');
const orderRoutes = require('./src/routes/orders');
const tableRoutes = require('./src/routes/tables');
const menuRoutes = require('./src/routes/menu');

const app = express();
const server = http.createServer(app);

const CORS_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet());

// Rate limiting
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

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));

// Public routes
app.use('/api/auth', authRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GastroSync API' });
});

// Protected routes
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Error no manejado:', err);
  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
  });
});

// WebSockets with authentication
io.use(socketAuthenticate);
setupOrderSocket(io);

// Conexión a BD y arranque
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`GastroSync backend corriendo en puerto ${PORT}`);
  });
});
