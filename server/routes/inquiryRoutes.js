import express from 'express';
import { createInquiry, getAllInquiries, updateInquiry, deleteInquiry } from '../controllers/inquiryController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public submit inquiry
router.post('/', createInquiry);

// Admin routes
router.get('/', verifyToken, requireAdmin, getAllInquiries);
router.put('/:id', verifyToken, requireAdmin, updateInquiry);
router.patch('/:id', verifyToken, requireAdmin, updateInquiry);
router.patch('/:id/status', verifyToken, requireAdmin, updateInquiry);
router.delete('/:id', verifyToken, requireAdmin, deleteInquiry);

export default router;
