import CMSContent from '../models/CMSContent.js';
import { dbStore, isMongoConnected } from '../services/dbStore.js';

export const getCMSConfig = async (req, res, next) => {
  try {
    if (isMongoConnected()) {
      let config = await CMSContent.findOne({ key: 'homepage_config' });
      if (config) return res.status(200).json({ success: true, config });
    }

    const config = dbStore.read('cms');
    res.status(200).json({ success: true, config });
  } catch (err) {
    next(err);
  }
};

export const updateCMSConfig = async (req, res, next) => {
  try {
    const updateData = req.body;

    if (isMongoConnected()) {
      let config = await CMSContent.findOne({ key: 'homepage_config' });
      if (!config) {
        config = new CMSContent({ key: 'homepage_config', ...updateData });
      } else {
        Object.assign(config, updateData);
      }
      await config.save();
      return res.status(200).json({ success: true, message: 'Website settings updated successfully.', config });
    }

    const current = dbStore.read('cms');
    const updated = { ...current, ...updateData };
    dbStore.write('cms', updated);

    res.status(200).json({ success: true, message: 'Website settings updated successfully.', config: updated });
  } catch (err) {
    next(err);
  }
};

export const uploadCMSBanner = async (req, res) => {
  if (!req.processedImage) {
    return res.status(400).json({ success: false, message: 'No image uploaded or processing failed.' });
  }

  res.status(200).json({
    success: true,
    message: 'Image converted to WebP successfully.',
    url: req.processedImage.url,
    thumbnailUrl: req.processedImage.thumbnailUrl
  });
};
