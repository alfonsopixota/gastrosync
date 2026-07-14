const {
  tableStatusSchema,
  createOrderSchema,
  updateItemSchema,
} = require('../schemas');

describe('Validation schemas', () => {
  describe('tableStatusSchema', () => {
    it('accepts valid data', () => {
      const result = tableStatusSchema.safeParse({
        tableId: '507f1f77bcf86cd799439011',
        status: 'occupied',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = tableStatusSchema.safeParse({
        tableId: '507f1f77bcf86cd799439011',
        status: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty tableId', () => {
      const result = tableStatusSchema.safeParse({
        tableId: '',
        status: 'free',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createOrderSchema', () => {
    it('accepts valid order', () => {
      const result = createOrderSchema.safeParse({
        restaurant: '507f1f77bcf86cd799439011',
        table: '507f1f77bcf86cd799439011',
        tableNumber: 1,
        items: [
          { menuItem: '507f1f77bcf86cd799439011', quantity: 2 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects order with no items', () => {
      const result = createOrderSchema.safeParse({
        restaurant: '507f1f77bcf86cd799439011',
        tableNumber: 1,
        items: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects order with zero quantity', () => {
      const result = createOrderSchema.safeParse({
        restaurant: '507f1f77bcf86cd799439011',
        tableNumber: 1,
        items: [
          { menuItem: '507f1f77bcf86cd799439011', quantity: 0 },
        ],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateItemSchema', () => {
    it('accepts valid status update', () => {
      const result = updateItemSchema.safeParse({
        orderId: '507f1f77bcf86cd799439011',
        itemId: '507f1f77bcf86cd799439011',
        status: 'preparing',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid item status', () => {
      const result = updateItemSchema.safeParse({
        orderId: '507f1f77bcf86cd799439011',
        itemId: '507f1f77bcf86cd799439011',
        status: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('sanitizeError', () => {
  const { sanitizeError } = require('../../utils/errors');

  it('returns message in development', () => {
    process.env.NODE_ENV = 'development';
    const result = sanitizeError(new Error('test error'));
    expect(result).toBe('test error');
  });

  it('returns generic message in production', () => {
    process.env.NODE_ENV = 'production';
    const result = sanitizeError(new Error('sensitive detail'));
    expect(result).toBe('Error interno del servidor');
  });
});
