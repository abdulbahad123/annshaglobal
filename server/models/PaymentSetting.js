import mongoose from 'mongoose';

const paymentSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global_payment_settings' },
  stripe: {
    enabled: { type: Boolean, default: true },
    publishableKey: { type: String, default: 'pk_test_sample_stripe_annsha' },
    secretKey: { type: String, default: 'sk_test_sample_stripe_annsha' },
    isLive: { type: Boolean, default: false }
  },
  razorpay: {
    enabled: { type: Boolean, default: true },
    keyId: { type: String, default: 'rzp_test_sample_key' },
    keySecret: { type: String, default: 'rzp_test_sample_secret' },
    isLive: { type: Boolean, default: false }
  },
  paypal: {
    enabled: { type: Boolean, default: false },
    clientId: { type: String, default: '' },
    secretKey: { type: String, default: '' },
    isLive: { type: Boolean, default: false }
  },
  cod: {
    enabled: { type: Boolean, default: true },
    extraFee: { type: Number, default: 0 },
    maxOrderAmount: { type: Number, default: 50000 }
  },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' }
}, { timestamps: true });

export default mongoose.model('PaymentSetting', paymentSettingSchema);
