import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  badge: {
    type: String,
    default: 'SPECIAL',
    trim: true
  },
  offerText: {
    type: String,
    default: 'Offer 🎁',
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    default: 'Limited Period Offer',
    trim: true
  },
  discountType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  discount: {
    type: Number,
    required: true,
    min: 1
  },
  minPurchaseAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  firstOrderOnly: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  usageLimit: {
    type: Number,
    default: 1000
  },
  usedCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Check if coupon is currently valid
couponSchema.methods.isValid = function(cartTotal = 0, isFirstOrder = true) {
  const now = new Date();
  
  if (!this.isActive) {
    return { valid: false, message: `Coupon "${this.code}" is currently disabled.` };
  }
  
  if (this.startDate && new Date(this.startDate) > now) {
    return { valid: false, message: `Coupon "${this.code}" has not started yet.` };
  }
  
  if (this.endDate && new Date(this.endDate) < now) {
    return { valid: false, message: `Coupon "${this.code}" has expired on ${new Date(this.endDate).toLocaleDateString()}.` };
  }
  
  if (this.minPurchaseAmount > 0 && cartTotal < this.minPurchaseAmount) {
    return { valid: false, message: `Minimum order of ₹${this.minPurchaseAmount} required to claim "${this.code}". Your current total is ₹${Math.round(cartTotal)}.` };
  }
  
  if (this.firstOrderOnly && !isFirstOrder) {
    return { valid: false, message: `Coupon "${this.code}" is valid for new customers on their 1st order only.` };
  }
  
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
    return { valid: false, message: `Coupon "${this.code}" has reached its maximum claim limit.` };
  }
  
  let discountAmount = 0;
  if (this.discountType === 'percentage') {
    discountAmount = Math.round((cartTotal * this.discount) / 100);
  } else {
    discountAmount = Math.min(this.discount, cartTotal);
  }
  
  return {
    valid: true,
    discountAmount,
    coupon: {
      code: this.code,
      title: this.title,
      badge: this.badge,
      offerText: this.offerText,
      discount: this.discount,
      discountType: this.discountType,
      discountAmount,
      minPurchaseAmount: this.minPurchaseAmount,
      firstOrderOnly: this.firstOrderOnly
    }
  };
};

export default mongoose.model('Coupon', couponSchema);
