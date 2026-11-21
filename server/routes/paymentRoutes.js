import express from 'express';
import { getPaymentSettings, updatePaymentSettings } from '../controllers/paymentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/settings', getPaymentSettings);
router.put('/settings', verifyToken, requireAdmin, updatePaymentSettings);

export default router;

