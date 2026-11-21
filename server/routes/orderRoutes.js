import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrdersAdmin,
  updateOrderStatus,
  getOrderById
} from '../controllers/orderController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/checkout', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);

// Admin Order Endpoints
router.get('/admin/all', verifyToken, requireAdmin, getAllOrdersAdmin);
router.get('/:id', verifyToken, getOrderById);
router.patch('/admin/:id/status', verifyToken, requireAdmin, updateOrderStatus);

export default router;

