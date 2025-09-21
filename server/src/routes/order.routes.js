import { Router } from 'express';
import { createOrder, getOrder, listOrders, getOrdersSummaryByProduct, updateOrderStatus } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All order routes require authentication
router.use(requireAuth);

// Create new order
router.post('/', createOrder);

// List orders for the authenticated user
router.get('/', listOrders);

// Summary: total quantities grouped by product name for the user
router.get('/summary/by-product', getOrdersSummaryByProduct);

// Get specific order
router.get('/:orderId', getOrder);

// Update order status
router.patch('/:orderId/status', updateOrderStatus);

export default router;
