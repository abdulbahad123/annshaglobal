import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getProductReviews
} from '../controllers/productController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { processImageToWebP } from '../middlewares/imageProcessor.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', verifyToken, addProductReview);
router.get('/detail/:slug', getProductBySlug);
router.get('/:slug', getProductBySlug);
router.get('/admin/all', verifyToken, requireAdmin, getAllProductsAdmin);

// Standalone image upload endpoints for Drag & Drop Slider & Thumbnail dropzones
router.post(
  '/upload-images',
  verifyToken,
  requireAdmin,
  upload.array('images', 10),
  processImageToWebP('products'),
  (req, res) => {
    const urls = req.processedImages ? req.processedImages.map(img => img.url) : [];
    res.status(200).json({ success: true, imageUrls: urls });
  }
);

router.post(
  '/upload-single',
  verifyToken,
  requireAdmin,
  upload.single('image'),
  processImageToWebP('products'),
  (req, res) => {
    const url = req.processedImage ? req.processedImage.url : (req.processedImages && req.processedImages[0]?.url) || '';
    res.status(200).json({ success: true, imageUrl: url });
  }
);

router.post(
  '/',
  verifyToken,
  requireAdmin,
  upload.array('images', 5),
  processImageToWebP('products'),
  createProduct
);

router.put(
  '/:id',
  verifyToken,
  requireAdmin,
  upload.array('images', 5),
  processImageToWebP('products'),
  updateProduct
);

router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

export default router;

