import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Staff name is required'], 
    trim: true, 
    maxlength: 100 
  },
  email: { 
    type: String, 
    required: [true, 'Staff email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true, 
    index: true 
  },
  role: { 
    type: String, 
    required: [true, 'Staff role is required'],
    enum: ['Administrator', 'Store Manager', 'Order Manager', 'Support Agent', 'Content Editor', 'Inventory Specialist'],
    default: 'Store Manager'
  },
  department: { 
    type: String, 
    default: 'Operations' 
  },
  phone: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active',
    index: true
  },
  permissions: {
    type: [String],
    default: ['products', 'orders', 'customers']
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  lastLogin: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model('Staff', staffSchema);

