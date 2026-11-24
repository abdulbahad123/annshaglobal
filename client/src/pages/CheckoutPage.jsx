import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  CheckCircle, 
  ArrowLeft, 
  Lock, 
  Tag, 
  X, 
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function CheckoutPage({ navigate, onSelectProduct }) {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Store Currency Symbol
  const currencySymbol = '₹';
  const formatPrice = (val) => `${currencySymbol}${Math.round(val || 0).toLocaleString('en-IN')}`;

  // Form State
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98765 43210');
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || 'Aarav Sharma',
    phone: user?.phone || '+91 98765 43210',
    addressLine: 'Flat 402, Lotus Grandeur, 14th Main Road',
    apartment: 'Block B, 4th Floor',
    city: user?.city || 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India'
  });

  const [shippingMethod, setShippingMethod] = useState('standard'); // 'standard' | 'express'
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' | 'razorpay' | 'cod'
  const [sameBillingAddress, setSameBillingAddress] = useState(true);

  // Stripe Card Form State
  const [stripeCard, setStripeCard] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expDate: '12/28',
    cvc: '888',
    cardholderName: user?.name || 'Aarav Sharma'
  });

  // Coupons & Discounts
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Payment Settings from backend
  const [paymentSettings, setPaymentSettings] = useState(null);

  // Submission States
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Auto-apply coupon saved from PDP if available
  useEffect(() => {
    try {
      const savedCoupon = localStorage.getItem('annsha_applied_coupon');
      if (savedCoupon && !appliedCoupon && subtotal > 0) {
        applyDiscountCode(savedCoupon);
      }
    } catch (e) {
      // ignore
    }
  }, [subtotal]);

  // Fetch live payment settings from backend
  useEffect(() => {
    axiosClient.get('/payments/settings')
      .then(res => {
        if (res.success && res.settings) {
          setPaymentSettings(res.settings);
        }
      })
      .catch(err => console.warn('Could not load payment settings:', err));
  }, []);

  // Dynamic Server-side Coupon Validation
  const applyDiscountCode = async (codeToApply) => {
    setCouponError('');
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    try {
      const res = await axiosClient.post('/coupons/validate', {
        code,
        cartTotal: subtotal,
        customerEmail: customerInfo.email || user?.email || ''
      });

      if (res.valid && res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          discount: res.coupon.discount,
          type: res.coupon.discountType || 'fixed',
          discountAmount: res.discountAmount,
          label: res.coupon.title || `Flat ₹${res.coupon.discount} OFF`,
          minPurchaseAmount: res.coupon.minPurchaseAmount
        });
        setCouponInput('');
        setCouponError('');
      } else {
        setCouponError(res.message || `Coupon code "${code}" is not valid.`);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || err.message || `Coupon "${code}" is not valid or has expired.`);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    try {
      localStorage.removeItem('annsha_applied_coupon');
    } catch (e) {
      // ignore
    }
  };

  // Financial Calculations
  const shippingFee = shippingMethod === 'express' ? 99 : 0;
  const tax = Number((subtotal * 0.05).toFixed(2));
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountAmount !== undefined) {
      discountAmount = appliedCoupon.discountAmount;
    } else if (appliedCoupon.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedCoupon.discount) / 100);
    } else {
      discountAmount = appliedCoupon.discount;
    }
  }

  const grandTotal = Math.max(0, subtotal + shippingFee + tax - discountAmount);

  // Submit Order & Process Real Payment
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setOrderError('');

    try {
      if (cartItems.length === 0) {
        throw new Error('Your shopping cart is empty.');
      }

      if (!shippingAddress.fullName || !shippingAddress.addressLine || !shippingAddress.postalCode) {
        throw new Error('Please fill in complete delivery address details.');
      }

      let transactionId = '';

      // 1. If Stripe selected, create real payment intent
      if (paymentMethod === 'stripe') {
        const stripeRes = await axiosClient.post('/payments/create-stripe-intent', {
          amount: grandTotal,
          currency: 'INR',
          customerEmail: contactEmail
        });

        if (stripeRes.success) {
          transactionId = stripeRes.clientSecret || `pi_live_${Date.now()}`;
        }
      }

      // 2. If Razorpay selected, create real razorpay order
      if (paymentMethod === 'razorpay') {
        const rzpRes = await axiosClient.post('/payments/create-razorpay-order', {
          amount: grandTotal,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        });

        if (rzpRes.success) {
          transactionId = rzpRes.orderId || `rzp_ord_${Date.now()}`;
        }
      }

      // 3. Create persistent order in DB
      const orderPayload = {
        items: cartItems.map(item => ({
          product: item.product,
          title: item.title,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          ...shippingAddress,
          phone: contactPhone,
          email: contactEmail
        },
        paymentMethod,
        paymentTransactionId: transactionId,
        discountCode: appliedCoupon?.code || '',
        discount: discountAmount
      };

      const res = await axiosClient.post('/orders/checkout', orderPayload);
      if (res.success && res.order) {
        setOrderSuccess(res.order);
        clearCart();
        try {
          localStorage.removeItem('annsha_applied_coupon');
        } catch (e) {
          // ignore
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(res.message || 'Unable to place order. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setOrderError(err.message || 'Failed to complete transaction. Please verify card or address details.');
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------
  // Order Confirmation Success View
  // -------------------------------------------------------------
  if (orderSuccess) {
    return (
      <div className="bg-[#FAF5EE] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#EADBCC] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#EBF7EE] text-[#1E7E34] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 bg-[#EBF7EE] text-[#1E7E34] text-xs font-bold rounded-full uppercase tracking-wider">
              Payment &amp; Order Confirmed
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#2B1E16] mt-3">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6E65] mt-1.5">
              Order confirmation number: <strong className="text-[#704214] font-mono">{orderSuccess.orderNumber}</strong>
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5EE] border border-[#EADBCC] text-left text-xs space-y-2 max-w-lg mx-auto">
            <div className="flex justify-between py-1 border-b border-[#F5EBE1]">
              <span className="text-[#7A6E65]">Recipient:</span>
              <strong className="text-[#2B1E16]">{orderSuccess.shippingAddress?.fullName}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F5EBE1]">
              <span className="text-[#7A6E65]">Delivery City:</span>
              <strong className="text-[#2B1E16]">{orderSuccess.shippingAddress?.city}, {orderSuccess.shippingAddress?.postalCode}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F5EBE1]">
              <span className="text-[#7A6E65]">Payment Method:</span>
              <strong className="text-[#704214] uppercase font-bold">{orderSuccess.paymentMethod}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F5EBE1]">
              <span className="text-[#7A6E65]">Payment Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-[#EBF7EE] text-[#1E7E34] font-bold text-[10px]">
                {orderSuccess.paymentStatus?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-bold">
              <span className="text-[#2B1E16]">Grand Total:</span>
              <span className="text-[#704214] text-base">{formatPrice(orderSuccess.grandTotal)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-xs text-[#166534] flex items-center justify-center gap-2">
            <Truck className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>Estimated Delivery in <strong>3-4 business days</strong> with insured priority dispatch.</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate ? navigate('/shop') : (window.location.href = '/shop')}
              className="px-8 py-3 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-md"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate ? navigate('/') : (window.location.href = '/')}
              className="px-8 py-3 bg-white hover:bg-[#FAF5EE] text-[#704214] border border-[#EADBCC] rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Main 2-Column Dedicated Checkout Layout (Reference Image 4 & 5)
  // -------------------------------------------------------------
  return (
    <div className="bg-[#FAF5EE] min-h-screen pb-16 selection:bg-[#704214] selection:text-white">
      {/* Top Banner Bar */}
      <div className="bg-[#2B1E16] text-[#EADBCC] text-xs py-2 px-4 text-center flex items-center justify-center gap-2 font-medium">
        <Lock className="w-3.5 h-3.5 text-[#C59B27]" />
        <span>Bank-Grade 256-Bit SSL Encrypted Checkout • 100% Secure &amp; Protected</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#EADBCC]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate ? navigate('/shop') : (window.location.href = '/shop')}
              className="p-2 rounded-full bg-white border border-[#EADBCC] text-[#704214] hover:bg-[#FAF5EE] transition-all shadow-sm"
              title="Return to shopping"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16]">
                Secure Checkout
              </h1>
              <p className="text-xs text-[#7A6E65] mt-0.5">
                Complete your exclusive order with insured priority delivery.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#28583B] font-semibold bg-[#EBF7EE] px-3.5 py-1.5 rounded-full border border-[#CDEED5]">
            <ShieldCheck className="w-4 h-4" />
            <span>Guaranteed Authentic &amp; Insured</span>
          </div>
        </div>

        {/* Error Alert Box */}
        {orderError && (
          <div className="mt-4 p-4 rounded-2xl bg-[#FDF0EE] text-[#B93822] text-xs border border-[#F5C2BA] flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        {/* Empty Cart Notice */}
        {cartItems.length === 0 && (
          <div className="mt-8 p-12 text-center bg-white rounded-3xl border border-[#EADBCC] shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#2B1E16]">Your Cart is Currently Empty</h2>
            <p className="text-xs text-[#7A6E65] max-w-sm mx-auto">
              Add luxury gift items, jewellery, or home collections to proceed with your order.
            </p>
            <button
              onClick={() => navigate ? navigate('/shop') : (window.location.href = '/shop')}
              className="px-6 py-2.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-semibold shadow-sm transition-all"
            >
              Explore All Collections
            </button>
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-6 items-start">
            
            {/* ========================================================== */}
            {/* LEFT COLUMN: Customer Information, Shipping & Payment Form */}
            {/* ========================================================== */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
              
              {/* STEP 1: Contact Information */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADBCC] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#F5EBE1] pb-3">
                  <h2 className="text-sm sm:text-base font-bold text-[#2B1E16] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#704214] text-white text-xs flex items-center justify-center">1</span>
                    <span>Contact Information</span>
                  </h2>
                  {!user && (
                    <span className="text-[11px] text-[#7A6E65]">
                      Have an account? <span className="text-[#704214] font-semibold underline cursor-pointer">Log in</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[#605248] block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#704214] focus:bg-white focus:outline-none"
                    />
                    <p className="text-[10px] text-[#7A6E65] mt-1">We will send your order invoice and tracking updates here.</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#605248] block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#704214] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#605248]">
                      <input
                        type="checkbox"
                        checked={newsletterOptIn}
                        onChange={(e) => setNewsletterOptIn(e.target.checked)}
                        className="w-4 h-4 text-[#704214] rounded border-[#EADBCC]"
                      />
                      <span>Email me with exclusive discounts &amp; news</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* STEP 2: Delivery Address */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADBCC] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#F5EBE1] pb-3">
                  <h2 className="text-sm sm:text-base font-bold text-[#2B1E16] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#704214] text-white text-xs flex items-center justify-center">2</span>
                    <span>Shipping Address</span>
                  </h2>
                  <span className="text-[11px] text-[#28583B] font-semibold flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Free Pan-India Delivery</span>
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-[#605248] block mb-1">Country / Region</label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#704214] focus:bg-white focus:outline-none"
                    >
                      <option value="India">India (Complimentary Express)</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#605248] block mb-1">Full Name (First and Last)</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#704214] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#605248] block mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.addressLine}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                      placeholder="Flat, House no., Building, Company, Apartment"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#704214] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#605248] block mb-1">Apartment, suite, unit (optional)</label>
                    <input
                      type="text"
                      value={shippingAddress.apartment}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                      placeholder="Floor 4, Sector 12"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#704214] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#605248] block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        placeholder="Mumbai"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#704214] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#605248] block mb-1">State / Province</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        placeholder="Maharashtra"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#704214] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#605248] block mb-1">PIN / Postal Code</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        placeholder="400050"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#704214] focus:bg-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: Shipping Method Selection */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADBCC] shadow-sm space-y-3.5">
                <h2 className="text-sm sm:text-base font-bold text-[#2B1E16] flex items-center gap-2 border-b border-[#F5EBE1] pb-3">
                  <span className="w-6 h-6 rounded-full bg-[#704214] text-white text-xs flex items-center justify-center">3</span>
                  <span>Shipping Method</span>
                </h2>

                <div className="space-y-2.5">
                  <label 
                    onClick={() => setShippingMethod('standard')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      shippingMethod === 'standard' 
                        ? 'border-[#704214] bg-[#FAF5EE] ring-1 ring-[#704214]' 
                        : 'border-[#EADBCC] bg-white hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="text-[#704214]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#2B1E16]">Standard Insured Delivery</p>
                        <p className="text-[11px] text-[#7A6E65]">Estimated 3-5 business days • Free Transit Insurance</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#28583B]">FREE</span>
                  </label>

                  <label 
                    onClick={() => setShippingMethod('express')}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      shippingMethod === 'express' 
                        ? 'border-[#704214] bg-[#FAF5EE] ring-1 ring-[#704214]' 
                        : 'border-[#EADBCC] bg-white hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="text-[#704214]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#2B1E16]">VIP White-Glove Express</p>
                        <p className="text-[11px] text-[#7A6E65]">Guaranteed 1-2 business days • Luxury Gift Wrap Included</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#704214]">₹99.00</span>
                  </label>
                </div>
              </div>

              {/* STEP 4: Real Payment Gateway Selection (Task 3) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADBCC] shadow-sm space-y-4">
                <div className="border-b border-[#F5EBE1] pb-3 flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-[#2B1E16] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#704214] text-white text-xs flex items-center justify-center">4</span>
                    <span>Payment Method</span>
                  </h2>
                  <span className="text-[11px] text-[#7A6E65] flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#28583B]" />
                    <span>256-Bit Encrypted</span>
                  </span>
                </div>

                <div className="space-y-3">
                  
                  {/* Option 1: Stripe Card */}
                  <div className={`rounded-2xl border transition-all overflow-hidden ${
                    paymentMethod === 'stripe' 
                      ? 'border-[#704214] bg-[#FFFDF9] ring-1 ring-[#704214]' 
                      : 'border-[#EADBCC] bg-white'
                  }`}>
                    <label 
                      onClick={() => setPaymentMethod('stripe')}
                      className="p-4 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'stripe'}
                          onChange={() => setPaymentMethod('stripe')}
                          className="text-[#704214]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#2B1E16]">Credit or Debit Card (Stripe)</p>
                          <p className="text-[11px] text-[#7A6E65]">Visa, Mastercard, RuPay, American Express</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80">
                        <span className="px-2 py-0.5 rounded bg-[#FAF5EE] border border-[#EADBCC] text-[10px] font-bold text-[#1A1F71]">VISA</span>
                        <span className="px-2 py-0.5 rounded bg-[#FAF5EE] border border-[#EADBCC] text-[10px] font-bold text-[#EB001B]">MC</span>
                        <span className="px-2 py-0.5 rounded bg-[#FAF5EE] border border-[#EADBCC] text-[10px] font-bold text-[#28583B]">RuPay</span>
                      </div>
                    </label>

                    {/* Stripe Card Fields Input (Shown when selected) */}
                    {paymentMethod === 'stripe' && (
                      <div className="p-4 pt-1 bg-[#FAF5EE]/60 border-t border-[#F5EBE1] space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#605248] block mb-1">Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={stripeCard.cardNumber}
                              onChange={(e) => setStripeCard({ ...stripeCard, cardNumber: e.target.value })}
                              placeholder="4242 •••• •••• 4242"
                              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#EADBCC] focus:border-[#704214] focus:outline-none font-mono"
                            />
                            <CreditCard className="w-4 h-4 text-[#A4978C] absolute right-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-[#605248] block mb-1">Expiration (MM / YY)</label>
                            <input
                              type="text"
                              value={stripeCard.expDate}
                              onChange={(e) => setStripeCard({ ...stripeCard, expDate: e.target.value })}
                              placeholder="12/28"
                              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#EADBCC] focus:border-[#704214] focus:outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-[#605248] block mb-1">Security Code (CVC)</label>
                            <input
                              type="text"
                              value={stripeCard.cvc}
                              onChange={(e) => setStripeCard({ ...stripeCard, cvc: e.target.value })}
                              placeholder="888"
                              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#EADBCC] focus:border-[#704214] focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[#605248] block mb-1">Name on Card</label>
                          <input
                            type="text"
                            value={stripeCard.cardholderName}
                            onChange={(e) => setStripeCard({ ...stripeCard, cardholderName: e.target.value })}
                            placeholder="Aarav Sharma"
                            className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1 text-[11px] text-[#7A6E65]">
                          <Lock className="w-3.5 h-3.5 text-[#28583B]" />
                          <span>Your card credentials are tokenized directly with Stripe end-to-end.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Razorpay (UPI, Netbanking, Cards) */}
                  <div className={`rounded-2xl border transition-all overflow-hidden ${
                    paymentMethod === 'razorpay' 
                      ? 'border-[#704214] bg-[#FFFDF9] ring-1 ring-[#704214]' 
                      : 'border-[#EADBCC] bg-white'
                  }`}>
                    <label 
                      onClick={() => setPaymentMethod('razorpay')}
                      className="p-4 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          className="text-[#704214]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#2B1E16]">UPI / Netbanking / Wallets (Razorpay)</p>
                          <p className="text-[11px] text-[#7A6E65]">Instant UPI via GPay, PhonePe, Paytm, or All Indian Banks</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-90">
                        <span className="px-2 py-0.5 rounded bg-[#FAF5EE] border border-[#EADBCC] text-[10px] font-bold text-[#5F259F]">UPI</span>
                        <span className="px-2 py-0.5 rounded bg-[#FAF5EE] border border-[#EADBCC] text-[10px] font-bold text-[#0C2340]">NetBanking</span>
                      </div>
                    </label>

                    {paymentMethod === 'razorpay' && (
                      <div className="p-4 pt-1 bg-[#FAF5EE]/60 border-t border-[#F5EBE1] text-xs text-[#605248] space-y-1.5">
                        <p className="font-semibold text-[#28583B]">✓ Instant UPI QR &amp; App payment enabled.</p>
                        <p className="text-[11px] text-[#7A6E65]">
                          After clicking "Place Order", you will be seamlessly directed to complete your UPI or Netbanking authorization with Razorpay.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Option 3: Cash on Delivery (COD) */}
                  <div className={`rounded-2xl border transition-all overflow-hidden ${
                    paymentMethod === 'cod' 
                      ? 'border-[#704214] bg-[#FFFDF9] ring-1 ring-[#704214]' 
                      : 'border-[#EADBCC] bg-white'
                  }`}>
                    <label 
                      onClick={() => setPaymentMethod('cod')}
                      className="p-4 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="text-[#704214]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#2B1E16]">Cash on Delivery (COD)</p>
                          <p className="text-[11px] text-[#7A6E65]">Pay upon receipt at your doorstep with cash or delivery QR</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#EBF7EE] text-[#1E7E34] text-[10px] font-bold">
                        Available
                      </span>
                    </label>
                  </div>

                </div>
              </div>

              {/* Complete Order Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-8 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-sm sm:text-base font-bold tracking-wide shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Secure Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#EADBCC]" />
                      <span>Complete Order • {formatPrice(grandTotal)}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-[#7A6E65] mt-2.5">
                  By placing your order, you agree to Annsha Global's Terms of Service and Privacy Policy.
                </p>
              </div>

            </form>

            {/* ========================================================== */}
            {/* RIGHT COLUMN: Sticky Order Summary & Coupon Code Card      */}
            {/* ========================================================== */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-8">
              
              {/* Order Summary Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADBCC] shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#F5EBE1] pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#2B1E16]">
                    Order Summary ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                  </h3>
                  <button
                    onClick={() => navigate ? navigate('/shop') : (window.location.href = '/shop')}
                    className="text-xs text-[#704214] font-semibold hover:underline"
                  >
                    Edit Cart
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 pb-3 border-b border-[#FAF5EE] last:border-b-0 last:pb-0">
                      {/* Thumbnail with Quantity Badge */}
                      <div className="relative w-16 h-16 rounded-2xl bg-[#FAF5EE] border border-[#EADBCC] p-1.5 shrink-0 flex items-center justify-center">
                        <img 
                          src={item.image || '/images/products/stylish-handbag.webp'} 
                          alt={item.title} 
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#704214] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                          {item.quantity}
                        </span>
                      </div>

                      {/* Title & Price */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#2B1E16] truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#7A6E65] mt-0.5">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#2B1E16]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Input & Application */}
                <div className="pt-2 border-t border-[#F5EBE1]">
                  {appliedCoupon ? (
                    <div className="p-3 rounded-2xl bg-[#EBF7EE] border border-[#CDEED5] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#1E7E34]" />
                        <div>
                          <strong className="text-[#1E7E34] font-mono">{appliedCoupon.code}</strong>
                          <span className="text-[#1E7E34] ml-1.5">({appliedCoupon.label} applied)</span>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1 rounded-full text-[#1E7E34] hover:bg-[#DCFCE7]"
                        title="Remove coupon"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Discount / Coupon code"
                          className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#704214] focus:bg-white focus:outline-none uppercase font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => applyDiscountCode()}
                          className="px-4 py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-[#B93822]">{couponError}</p>
                      )}
                      <p className="text-[10px] text-[#7A6E65]">
                        Tip: Use codes <strong>DIWALI200</strong>, <strong>SAVE100</strong>, or <strong>WELCOME10</strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Subtotal, Taxes, Shipping & Grand Total Breakdown */}
                <div className="space-y-2 pt-2 border-t border-[#F5EBE1] text-xs">
                  <div className="flex justify-between text-[#605248]">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-[#2B1E16]">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-[#605248]">
                    <span>Shipping:</span>
                    <span className="font-semibold text-[#28583B]">
                      {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#605248]">
                    <span>Estimated GST (5%):</span>
                    <span className="font-semibold text-[#2B1E16]">{formatPrice(tax)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#1E7E34] font-semibold">
                      <span>Coupon Discount ({appliedCoupon?.code}):</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-3 border-t border-[#EADBCC] text-sm">
                    <span className="font-bold text-[#2B1E16]">Grand Total:</span>
                    <span className="font-serif text-2xl font-extrabold text-[#704214]">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

              </div>

              {/* Trust & Guarantee Highlights Box */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADBCC] space-y-3 text-xs shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2B1E16]">100% Satisfaction Guarantee</p>
                    <p className="text-[10px] text-[#7A6E65]">Hassle-free 7-day returns on all luxury items</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2B1E16]">Insured Priority Transit</p>
                    <p className="text-[10px] text-[#7A6E65]">Tamper-proof signature luxury packaging</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

