process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NODE_ENV = 'test';

const AppError = require('../../utils/AppError');

jest.mock('../../models/Order', () => ({
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../../models/MenuItem', () => ({
  find: jest.fn(),
}));

const Order = require('../../models/Order');
const MenuItem = require('../../models/MenuItem');
const orderService = require('../orderService');

const mockRestaurant = '507f1f77bcf86cd799439011';
const mockTable = '507f1f77bcf86cd799439012';
const mockMenuItemId = '507f1f77bcf86cd799439013';
const mockOrderId = '507f1f77bcf86cd799439014';
const mockItemId = '507f1f77bcf86cd799439015';

describe('orderService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getActiveOrders', () => {
    it('returns active orders for a restaurant', async () => {
      const mockOrders = [{ _id: '1', tableNumber: 1 }];
      const populateChain = { sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockOrders) }) };
      Order.find.mockReturnValue({ populate: jest.fn().mockReturnValue(populateChain) });

      const result = await orderService.getActiveOrders(mockRestaurant);

      expect(Order.find).toHaveBeenCalledWith({
        restaurant: mockRestaurant,
        status: { $in: ['open', 'in_progress'] },
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('createOrder', () => {
    it('creates an order with correct total', async () => {
      const mockMenuItems = [{ _id: mockMenuItemId, name: 'Patatas bravas', price: 8.5 }];
      const mockCreatedOrder = { _id: mockOrderId, total: 17 };
      const mockPopulatedOrder = { _id: mockOrderId, total: 17, items: [{ menuItem: mockMenuItems[0] }] };

      MenuItem.find.mockResolvedValue(mockMenuItems);
      Order.create.mockResolvedValue(mockCreatedOrder);
      Order.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockPopulatedOrder) });

      const result = await orderService.createOrder({
        restaurant: mockRestaurant,
        table: mockTable,
        tableNumber: 1,
        items: [{ menuItem: mockMenuItemId, quantity: 2 }],
      });

      expect(MenuItem.find).toHaveBeenCalledWith({
        _id: { $in: [mockMenuItemId] },
        restaurant: mockRestaurant,
      });
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurant: mockRestaurant,
          table: mockTable,
          total: 17,
        })
      );
      expect(result).toEqual(mockPopulatedOrder);
    });

    it('throws if menu item does not exist', async () => {
      MenuItem.find.mockResolvedValue([]);

      await expect(
        orderService.createOrder({
          restaurant: mockRestaurant,
          table: mockTable,
          tableNumber: 1,
          items: [{ menuItem: mockMenuItemId, quantity: 1 }],
        })
      ).rejects.toThrow('Algún item del menú no existe');
    });
  });

  describe('updateItemStatus', () => {
    it('updates item status in an order', async () => {
      const mockUpdated = { _id: mockOrderId, items: [{ _id: mockItemId, status: 'preparing' }] };
      const populateChain = { populate: jest.fn().mockResolvedValue(mockUpdated) };
      Order.findOneAndUpdate.mockReturnValue({ populate: jest.fn().mockReturnValue(populateChain) });

      const result = await orderService.updateItemStatus({
        orderId: mockOrderId,
        itemId: mockItemId,
        status: 'preparing',
      });

      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockOrderId, 'items._id': mockItemId },
        { $set: { 'items.$.status': 'preparing' } },
        { new: true }
      );
    });
  });
});
