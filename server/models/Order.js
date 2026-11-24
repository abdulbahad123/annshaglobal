import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [orderItemSchema],

  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },

  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },

  paymentMethod: { type: String, enum: ['stripe', 'paypal', 'cod', 'razorpay'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending', index: true },
  paymentTransactionId: { type: String, default: '' },

  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String, default: '' }
}, { timestamps: true });

orderSchema.index({ createdAt: -1, orderStatus: 1, paymentStatus: 1 });

export default mongoose.model('Order', orderSchema);

