import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  sku: { type: String, required: true, unique: true, uppercase: true, index: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, min: 0, default: 0 },
  stock: { type: Number, required: true, default: 10, min: 0 },
  
  images: [{ type: String, required: true }], // WebP image URLs
  
  // Luxury Rich Specs & Variants requested in Tasks 3 & 4
  subtitle: { type: String, default: '' },
  orderIndex: { type: Number, default: 0 },
  weight: { type: String, default: '' },
  dimensions: { type: String, default: '' },
  material: { type: String, default: '' },
  variants: [{
    name: { type: String, default: 'Default' },
    color: { type: String, default: 'Beige' },
    hex: { type: String, default: '#E4CFBA' },
    image: { type: String, default: '' }
  }],
  sizes: [{ type: String }],
  features: [{ type: String }],
  
  badge: { 
    type: String, 
    enum: ['none', 'todays_deals', 'top_rated', 'trending', 'new_arrivals'], 
    default: 'none',
    index: true 
  },
  
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  numReviews: { type: Number, default: 12 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

productSchema.index({ createdAt: -1, badge: 1, price: 1 });

export default mongoose.model('Product', productSchema);

