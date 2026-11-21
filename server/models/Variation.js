import mongoose from 'mongoose';

const variationOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  colorCode: { type: String, default: '' },
  hex: { type: String, default: '' }
}, { _id: false });

const variationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  categorySlug: { type: String, default: '' },
  subcategory: { type: String, default: '-' },
  options: [variationOptionSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Variation', variationSchema);

