import express from 'express';
import {
  getCategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { processImageToWebP } from '../middlewares/imageProcessor.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/admin/all', verifyToken, requireAdmin, getAllCategoriesAdmin);

router.post(
  '/',
  verifyToken,
  requireAdmin,
  upload.single('image'),
  processImageToWebP('categories'),
  createCategory
);

router.put(
  '/:id',
  verifyToken,
  requireAdmin,
  upload.single('image'),
  processImageToWebP('categories'),
  updateCategory
);

router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

export default router;

