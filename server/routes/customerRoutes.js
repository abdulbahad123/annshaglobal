import express from 'express';
import {
  getCustomers,
  getCustomerStats,
  getCustomerById,
  toggleBlockCustomer
} from '../controllers/customerController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/', getCustomers);
router.get('/stats', getCustomerStats);
router.get('/:id', getCustomerById);
router.patch('/:id/block', toggleBlockCustomer);

export default router;

