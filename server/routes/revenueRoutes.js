import express from 'express';
import { getRevenueOverview } from '../controllers/revenueController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/overview', getRevenueOverview);

export default router;

