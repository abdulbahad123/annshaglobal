import express from 'express';
import { 
  getPaymentSettings, 
  updatePaymentSettings, 
  createStripeIntent, 
  createRazorpayOrder 
} from '../controllers/paymentController.js';
import { verifyToken, optionalAuth } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public / Authenticated settings
router.get('/settings', optionalAuth, getPaymentSettings);
router.put('/settings', verifyToken, requireAdmin, updatePaymentSettings);

// Real Payment Gateway Intent / Order Creation
router.post('/create-stripe-intent', optionalAuth, createStripeIntent);
router.post('/create-razorpay-order', optionalAuth, createRazorpayOrder);

export default router;
