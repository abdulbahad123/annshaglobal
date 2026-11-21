import express from 'express';
import { getCMSConfig, updateCMSConfig, uploadCMSBanner } from '../controllers/cmsController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { processImageToWebP } from '../middlewares/imageProcessor.js';

const router = express.Router();

router.get('/config', getCMSConfig);
router.put('/config', verifyToken, requireAdmin, updateCMSConfig);

router.post(
  '/upload-banner',
  verifyToken,
  requireAdmin,
  upload.single('image'),
  processImageToWebP('banners'),
  uploadCMSBanner
);

export default router;

