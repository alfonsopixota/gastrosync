const { z } = require('zod');

const VALID_TABLE_STATUSES = ['free', 'occupied', 'reserved'];
const VALID_ORDER_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'];
const VALID_ITEM_STATUSES = ['pending', 'preparing', 'ready', 'served'];

const tableStatusSchema = z.object({
  tableId: z.string().min(1),
  status: z.enum(VALID_TABLE_STATUSES),
});

const orderItemSchema = z.object({
  menuItem: z.string().min(1),
  name: z.string().optional(),
  quantity: z.number().int().min(1),
  notes: z.string().max(200).optional(),
});

const createOrderSchema = z.object({
  restaurant: z.string().min(1),
  table: z.string().min(1).optional(),
  tableNumber: z.number().int().min(1),
  items: z.array(orderItemSchema).min(1).max(50),
  waiter: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

const updateItemSchema = z.object({
  orderId: z.string().min(1),
  itemId: z.string().min(1),
  status: z.enum(VALID_ITEM_STATUSES),
});

module.exports = {
  VALID_TABLE_STATUSES,
  VALID_ORDER_STATUSES,
  VALID_ITEM_STATUSES,
  tableStatusSchema,
  createOrderSchema,
  updateItemSchema,
};
