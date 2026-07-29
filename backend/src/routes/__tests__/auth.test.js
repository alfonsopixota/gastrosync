process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@test.com',
    role: 'waiter',
    restaurant: '507f1f77bcf86cd799439012',
    active: true,
    comparePassword: jest.fn(),
  };

  return {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    mockUser,
  };
});

const config = require('../../config');
const User = require('../../models/User');
const { createApp } = require('../../../server');

const app = createApp();

describe('Auth routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/auth/register', () => {
    it('creates a new user and returns token', async () => {
      const newUser = { ...User.mockUser, comparePassword: undefined };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(newUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          restaurant: '507f1f77bcf86cd799439012',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('returns 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test@test.com',
          password: '123',
          restaurant: '507f1f77bcf86cd799439012',
        });

      expect(res.status).toBe(400);
    });

    it('returns 409 if user already exists', async () => {
      User.findOne.mockResolvedValue(User.mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test@test.com',
          password: 'password123',
          restaurant: '507f1f77bcf86cd799439012',
        });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns token for valid credentials', async () => {
      User.findOne.mockResolvedValue(User.mockUser);
      User.mockUser.comparePassword.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('returns 401 for invalid password', async () => {
      User.findOne.mockResolvedValue(User.mockUser);
      User.mockUser.comparePassword.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('returns 401 if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notfound@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });

    it('returns 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current user with valid token', async () => {
      const token = jwt.sign(
        { id: User.mockUser._id, role: User.mockUser.role, restaurant: User.mockUser.restaurant },
        config.jwtSecret,
        { expiresIn: '1h' }
      );
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(User.mockUser) });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email');
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
    });
  });
});
