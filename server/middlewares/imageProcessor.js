import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const processImageToWebP = (subfolder = 'products') => {
  return async (req, res, next) => {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return next();
    }

    const uploadDir = path.join(process.cwd(), 'uploads', subfolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const convertBufferToWebP = async (fileBuffer) => {
      const uniqueId = uuidv4();
      const filename = `${uniqueId}.webp`;
      const thumbFilename = `thumb-${uniqueId}.webp`;
      const fullPath = path.join(uploadDir, filename);
      const thumbPath = path.join(uploadDir, thumbFilename);

      // Re-encode to clean, compressed WebP (82% quality for great compression + high fidelity)
      await sharp(fileBuffer)
        .rotate() // auto-orient based on orientation tag
        .webp({ quality: 82, effort: 4 })
        .toFile(fullPath);

      // Create thumbnail for fast gallery/list rendering
      await sharp(fileBuffer)
        .resize(350, 350, { fit: 'cover' })
        .webp({ quality: 75 })
        .toFile(thumbPath);

      return {
        url: `/uploads/${subfolder}/${filename}`,
        thumbnailUrl: `/uploads/${subfolder}/${thumbFilename}`
      };
    };

    try {
      if (req.file) {
        req.processedImage = await convertBufferToWebP(req.file.buffer);
      } else if (req.files && Array.isArray(req.files)) {
        req.processedImages = await Promise.all(
          req.files.map(file => convertBufferToWebP(file.buffer))
        );
      }
      next();
    } catch (err) {
      console.error('Sharp Image Processing Error:', err);
      return res.status(400).json({
        success: false,
        message: 'Image processing failed. Ensure file is a valid image.',
        error: err.message
      });
    }
  };
};

