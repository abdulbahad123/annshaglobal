import express from 'express';
import { createSubscriber, getAllSubscribers, deleteSubscriber } from '../controllers/subscriberController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public subscribe
router.post('/', createSubscriber);

// Admin routes
router.get('/', verifyToken, requireAdmin, getAllSubscribers);
router.delete('/:id', verifyToken, requireAdmin, deleteSubscriber);

export default router;
