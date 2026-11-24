import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

// 1. Get all active & unexpired storefront coupons (for PDP and Checkout)
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    // Only return coupons where:
    // - isActive is true
    // - startDate is either null or <= now
    // - endDate is >= now (auto-hides expired coupons!)
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { startDate: { $lte: now } },
        { startDate: { $exists: false } },
        { startDate: null }
      ],
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });

    // Seed default coupons if none exist in DB yet
    if (coupons.length === 0) {
      const defaultCoupons = [
        {
          code: 'NEW100',
          badge: 'WELCOME',
          offerText: 'Offer 🎁',
          title: 'Flat ₹100 OFF',
          subtitle: 'For New Customers Only',
          discountType: 'fixed',
          discount: 100,
          minPurchaseAmount: 499,
          firstOrderOnly: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          isActive: true
        },
        {
          code: 'DIWALI200',
          badge: 'DIWALI',
          offerText: 'Offer 💥',
          title: 'Flat 200Rs OFF',
          subtitle: 'For All Orders Above ₹1499',
          discountType: 'fixed',
          discount: 200,
          minPurchaseAmount: 1499,
          firstOrderOnly: false,
          startDate: new Date(),
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          isActive: true
        },
        {
          code: 'SAVE100',
          badge: 'SPECIAL',
          offerText: 'Offer ⚡',
          title: 'Flat ₹100 OFF',
          subtitle: 'On Orders Above ₹999',
          discountType: 'fixed',
          discount: 100,
          minPurchaseAmount: 999,
          firstOrderOnly: false,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          isActive: true
        }
      ];

      const created = await Coupon.insertMany(defaultCoupons);
      return res.status(200).json({ success: true, coupons: created });
    }

    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get all coupons for Admin Portal (includes expired/inactive)
export const getAllCouponsAdmin = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error('Error fetching admin coupons:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create a new coupon (Admin)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      badge,
      offerText,
      title,
      subtitle,
      discountType,
      discount,
      minPurchaseAmount,
      firstOrderOnly,
      startDate,
      endDate,
      isActive,
      usageLimit
    } = req.body;

    if (!code || !title || !discount || !endDate) {
      return res.status(400).json({ success: false, message: 'Code, title, discount, and end date are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon with code "${cleanCode}" already exists.` });
    }

    const coupon = new Coupon({
      code: cleanCode,
      badge: badge || 'SPECIAL',
      offerText: offerText || 'Offer 🎁',
      title,
      subtitle: subtitle || 'Limited Period Offer',
      discountType: discountType || 'fixed',
      discount: Number(discount),
      minPurchaseAmount: Number(minPurchaseAmount || 0),
      firstOrderOnly: Boolean(firstOrderOnly),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      isActive: isActive !== false,
      usageLimit: Number(usageLimit || 1000)
    });

    await coupon.save();
    res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update coupon (Admin)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
    }
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    res.status(200).json({ success: true, message: 'Coupon updated successfully', coupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete coupon (Admin)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Validate & Claim Coupon in real-time (Storefront & Checkout)
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal = 0, customerEmail } = req.body;

    if (!code) {
      return res.status(400).json({ valid: false, message: 'Please enter a coupon code.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: `Coupon "${cleanCode}" does not exist.` });
    }

    // Check if customer is a first-time buyer
    let isFirstOrder = true;
    if (customerEmail) {
      const pastOrders = await Order.countDocuments({
        $or: [
          { 'customer.email': customerEmail.toLowerCase().trim() },
          { userEmail: customerEmail.toLowerCase().trim() }
        ]
      });
      if (pastOrders > 0) {
        isFirstOrder = false;
      }
    }

    const result = coupon.isValid(Number(cartTotal), isFirstOrder);

    if (!result.valid) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      valid: true,
      message: `Coupon "${coupon.code}" claimed! Saved ₹${result.discountAmount}`,
      discountAmount: result.discountAmount,
      coupon: result.coupon
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ valid: false, message: error.message });
  }
};
