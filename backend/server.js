require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./src/config/db');
const setupOrderSocket = require('./src/socket/orderHandler');
const orderRoutes = require('./src/routes/orders');
const tableRoutes = require('./src/routes/tables');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Rutas
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GastroSync API' });
});

// WebSockets
setupOrderSocket(io);

// Conexión a BD y arranque
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`GastroSync backend corriendo en puerto ${PORT}`);
  });
});
