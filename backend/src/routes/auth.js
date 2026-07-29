const { Router } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { JWT_SECRET } = require('../middleware/auth');

const router = Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, restaurant: user.restaurant },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, restaurant } = req.body;

    if (!name || !email || !password || !restaurant) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: name, email, password, restaurant' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'waiter',
      restaurant,
    });

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), active: true });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

module.exports = router;
