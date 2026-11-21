import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
  phone: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' },
  
  // Geolocation & Security Tracking
  registrationIp: { type: String, default: '' },
  country: { type: String, default: 'United States', index: true },
  countryCode: { type: String, default: 'US' },
  city: { type: String, default: 'New York' },
  lastLoginIp: { type: String, default: '' },
  lastLoginAt: { type: Date, default: Date.now },

  // Customer activity metrics
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);

