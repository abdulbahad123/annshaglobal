import express from 'express';
import {
  getActiveCoupons,
  getAllCouponsAdmin,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} from '../controllers/couponController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getActiveCoupons);
router.post('/validate', validateCoupon);

// Admin protected routes
router.get('/admin/all', verifyToken, requireAdmin, getAllCouponsAdmin);
router.post('/admin', verifyToken, requireAdmin, createCoupon);
router.put('/admin/:id', verifyToken, requireAdmin, updateCoupon);
router.delete('/admin/:id', verifyToken, requireAdmin, deleteCoupon);

export default router;
