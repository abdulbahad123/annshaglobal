import PaymentSetting from '../models/PaymentSetting.js';
import { dbStore, isMongoConnected } from '../services/dbStore.js';

export const getPaymentSettings = async (req, res, next) => {
  try {
    if (isMongoConnected()) {
      let settings = await PaymentSetting.findOne({ key: 'global_payment_settings' });
      if (settings) return res.status(200).json({ success: true, settings });
    }

    const settings = dbStore.read('payments');
    res.status(200).json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

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

    const current = dbStore.read('payments');
    const updated = { ...current, ...updateData };
    dbStore.write('payments', updated);

    res.status(200).json({ success: true, message: 'Payment settings updated successfully.', settings: updated });
  } catch (err) {
    next(err);
  }
};
