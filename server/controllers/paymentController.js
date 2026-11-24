import PaymentSetting from '../models/PaymentSetting.js';
import { dbStore, isMongoConnected } from '../services/dbStore.js';
import Stripe from 'stripe';
import Razorpay from 'razorpay';

// Helper to fetch current payment settings
const fetchCurrentSettings = async () => {
  if (isMongoConnected()) {
    let settings = await PaymentSetting.findOne({ key: 'global_payment_settings' });
    if (!settings) {
      settings = await PaymentSetting.create({
        key: 'global_payment_settings',
        stripe: {
          enabled: true,
          publishableKey: 'pk_test_sample_stripe_annsha',
          secretKey: 'sk_test_sample_stripe_annsha',
          isLive: false
        },
        razorpay: {
          enabled: true,
          keyId: 'rzp_test_sample_key',
          keySecret: 'rzp_test_sample_secret',
          isLive: false
        },
        cod: {
          enabled: true,
          extraFee: 0,
          maxOrderAmount: 50000
        },
        currency: 'INR',
        currencySymbol: '₹'
      });
    }
    return settings.toObject ? settings.toObject() : settings;
  }

  let settings = dbStore.read('payments');
  if (!settings || !settings.stripe) {
    settings = {
      stripe: { enabled: true, publishableKey: 'pk_test_sample_stripe_annsha', secretKey: 'sk_test_sample_stripe_annsha', isLive: false },
      razorpay: { enabled: true, keyId: 'rzp_test_sample_key', keySecret: 'rzp_test_sample_secret', isLive: false },
      cod: { enabled: true, extraFee: 0, maxOrderAmount: 50000 },
      currency: 'INR',
      currencySymbol: '₹'
    };
    dbStore.write('payments', settings);
  }
  return settings;
};

// 1. Get Payment Settings
// Public clients get publishable keys & public toggles. Admins get full credentials.
export const getPaymentSettings = async (req, res, next) => {
  try {
    const settings = await fetchCurrentSettings();
    const isAdmin = req.user && req.user.role === 'admin';

    if (isAdmin) {
      return res.status(200).json({ success: true, settings });
    }

    // Public sanitized version
    const publicSettings = {
      stripe: {
        enabled: Boolean(settings.stripe?.enabled),
        publishableKey: settings.stripe?.publishableKey || '',
        isLive: Boolean(settings.stripe?.isLive)
      },
      razorpay: {
        enabled: Boolean(settings.razorpay?.enabled),
        keyId: settings.razorpay?.keyId || '',
        isLive: Boolean(settings.razorpay?.isLive)
      },
      paypal: {
        enabled: Boolean(settings.paypal?.enabled),
        clientId: settings.paypal?.clientId || '',
        isLive: Boolean(settings.paypal?.isLive)
      },
      cod: {
        enabled: settings.cod?.enabled !== false,
        extraFee: Number(settings.cod?.extraFee) || 0,
        maxOrderAmount: Number(settings.cod?.maxOrderAmount) || 50000
      },
      currency: settings.currency || 'INR',
      currencySymbol: settings.currencySymbol || '₹'
    };

    res.status(200).json({ success: true, settings: publicSettings });
  } catch (err) {
    next(err);
  }
};

// 2. Update Payment Settings (Admin Only)
export const updatePaymentSettings = async (req, res, next) => {
  try {
    const updateData = req.body;

    if (isMongoConnected()) {
      let settings = await PaymentSetting.findOne({ key: 'global_payment_settings' });
      if (!settings) {
        settings = new PaymentSetting({ key: 'global_payment_settings', ...updateData });
      } else {
        Object.assign(settings, updateData);
      }
      await settings.save();
      return res.status(200).json({ success: true, message: 'Payment settings updated successfully.', settings });
    }

    const current = dbStore.read('payments') || {};
    const updated = { ...current, ...updateData };
    dbStore.write('payments', updated);

    res.status(200).json({ success: true, message: 'Payment settings updated successfully.', settings: updated });
  } catch (err) {
    next(err);
  }
};

// 3. Create Real Stripe Payment Intent
export const createStripeIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', orderId, customerEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });
    }

    const settings = await fetchCurrentSettings();
    const secretKey = settings.stripe?.secretKey;

    if (!settings.stripe?.enabled) {
      return res.status(400).json({ success: false, message: 'Stripe gateway is currently disabled.' });
    }

    if (!secretKey || secretKey.includes('sample_stripe')) {
      // Test simulator mode if sample key hasn't been replaced yet
      const simulatedClientSecret = `pi_simulated_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
      return res.status(200).json({
        success: true,
        clientSecret: simulatedClientSecret,
        publishableKey: settings.stripe?.publishableKey || 'pk_test_sample_stripe_annsha',
        isSimulated: true,
        message: 'Using test simulator mode. Add your real Stripe Secret Key in Admin > Payment Settings to process live charges.'
      });
    }

    // Call Real Stripe API
    try {
      const stripeInstance = new Stripe(secretKey);
      
      // Zero-decimal currencies like JPY vs standard 2-decimal like USD/INR
      const multiplier = ['jpy', 'krw'].includes(currency.toLowerCase()) ? 1 : 100;
      const chargeAmount = Math.round(Number(amount) * multiplier);

      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: chargeAmount,
        currency: currency.toLowerCase(),
        receipt_email: customerEmail || undefined,
        metadata: {
          orderId: orderId || `order_${Date.now()}`,
          store: 'Annsha Global'
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      return res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        publishableKey: settings.stripe?.publishableKey,
        isSimulated: false
      });
    } catch (stripeErr) {
      console.warn('Stripe API error:', stripeErr.message);
      // If key is invalid or restricted, provide diagnostic and test fallback
      return res.status(200).json({
        success: true,
        clientSecret: `pi_test_${Date.now()}_fallback`,
        publishableKey: settings.stripe?.publishableKey,
        isSimulated: true,
        warning: `Stripe API response: ${stripeErr.message}. Simulation fallback enabled.`
      });
    }
  } catch (err) {
    next(err);
  }
};

// 4. Create Real Razorpay Order
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });
    }

    const settings = await fetchCurrentSettings();
    const keyId = settings.razorpay?.keyId;
    const keySecret = settings.razorpay?.keySecret;

    if (!settings.razorpay?.enabled) {
      return res.status(400).json({ success: false, message: 'Razorpay gateway is currently disabled.' });
    }

    if (!keyId || !keySecret || keyId.includes('sample_key')) {
      // Test simulator mode
      const simulatedOrderId = `order_sim_${Date.now()}`;
      return res.status(200).json({
        success: true,
        orderId: simulatedOrderId,
        amount: Math.round(Number(amount) * 100),
        currency: currency.toUpperCase(),
        keyId: keyId || 'rzp_test_sample_key',
        isSimulated: true,
        message: 'Using test simulator mode. Add your live/test Razorpay Key ID and Secret in Admin > Payment Settings.'
      });
    }

    // Call Real Razorpay API
    try {
      const razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });

      const options = {
        amount: Math.round(Number(amount) * 100), // in paise
        currency: currency.toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}`,
        payment_capture: 1
      };

      const order = await razorpayInstance.orders.create(options);

      return res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId,
        isSimulated: false
      });
    } catch (rzpErr) {
      console.warn('Razorpay API error:', rzpErr.message);
      return res.status(200).json({
        success: true,
        orderId: `order_fallback_${Date.now()}`,
        amount: Math.round(Number(amount) * 100),
        currency: currency.toUpperCase(),
        keyId: keyId,
        isSimulated: true,
        warning: `Razorpay API response: ${rzpErr.message}. Test simulation active.`
      });
    }
  } catch (err) {
    next(err);
  }
};
