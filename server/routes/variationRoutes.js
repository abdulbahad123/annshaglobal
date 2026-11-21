import express from 'express';
import {
  getVariations,
  getVariationById,
  createVariation,
  updateVariation,
  deleteVariation
} from '../controllers/variationController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', getVariations);
router.get('/:id', getVariationById);
router.post('/', verifyToken, requireAdmin, createVariation);
router.put('/:id', verifyToken, requireAdmin, updateVariation);
router.delete('/:id', verifyToken, requireAdmin, deleteVariation);

export default router;

