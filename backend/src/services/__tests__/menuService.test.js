process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NODE_ENV = 'test';

jest.mock('../../models/MenuItem', () => ({
  find: jest.fn(),
}));

const MenuItem = require('../../models/MenuItem');
const menuService = require('../menuService');

const mockRestaurant = '507f1f77bcf86cd799439011';

describe('menuService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getAvailableMenuItems', () => {
    it('returns available menu items for a restaurant', async () => {
      const mockItems = [{ name: 'Patatas bravas' }, { name: 'Tortilla' }];
      MenuItem.find.mockResolvedValue(mockItems);

      const result = await menuService.getAvailableMenuItems(mockRestaurant);

      expect(MenuItem.find).toHaveBeenCalledWith({
        restaurant: mockRestaurant,
        available: true,
      });
      expect(result).toEqual(mockItems);
    });

    it('returns empty array when no items available', async () => {
      MenuItem.find.mockResolvedValue([]);

      const result = await menuService.getAvailableMenuItems(mockRestaurant);

      expect(result).toEqual([]);
    });
  });
});
