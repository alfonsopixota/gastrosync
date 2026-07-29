process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NODE_ENV = 'test';

const AppError = require('../../utils/AppError');

jest.mock('../../models/Table', () => ({
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

const Table = require('../../models/Table');
const tableService = require('../tableService');

const mockRestaurant = '507f1f77bcf86cd799439011';
const mockTableId = '507f1f77bcf86cd799439012';

describe('tableService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getTablesByRestaurant', () => {
    it('returns tables sorted by number', async () => {
      const mockTables = [{ number: 1 }, { number: 2 }];
      const sortChain = jest.fn().mockResolvedValue(mockTables);
      Table.find.mockReturnValue({ sort: sortChain });

      const result = await tableService.getTablesByRestaurant(mockRestaurant);

      expect(Table.find).toHaveBeenCalledWith({ restaurant: mockRestaurant });
      expect(sortChain).toHaveBeenCalledWith('number');
      expect(result).toEqual(mockTables);
    });
  });

  describe('updateTableStatus', () => {
    it('updates table status', async () => {
      const mockTable = { _id: mockTableId, status: 'occupied' };
      Table.findByIdAndUpdate.mockResolvedValue(mockTable);

      const result = await tableService.updateTableStatus(mockTableId, 'occupied');

      expect(Table.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTableId,
        { status: 'occupied' },
        { new: true }
      );
      expect(result).toEqual(mockTable);
    });

    it('throws if table not found', async () => {
      Table.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        tableService.updateTableStatus(mockTableId, 'occupied')
      ).rejects.toThrow('Mesa no encontrada');
    });
  });
});
