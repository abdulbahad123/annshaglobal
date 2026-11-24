import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Share2, 
  Plus, 
  Minus, 
  Maximize2, 
  Percent, 
  Check, 
  ChevronRight,
  ChevronLeft,
  MapPin,
  Copy,
  Clock,
  Eye,
  Award,
  Sparkles,
  Zap,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductDetailPage({ 
  product, 
  onBack, 
  onSelectProduct, 
  onSelectCategory,
  onShopBanner,
  allProducts = [], 
  onBuyNow,
  cmsConfig
}) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  // CMS PDP Dynamic Configuration with Defaults
  const pdpConfig = cmsConfig?.pdpSettings || {};
  const urgencyConfig = pdpConfig.urgency || {
    viewingCount: 65,
    saleEndsHours: 12,
    saleEndsMinutes: 42,
    saleEndsSeconds: 31,
    bestsellerBadge: true,
    ratingText: '4.87/5 Rated by 119 Verified Customers'
  };

  const welcomeOfferConfig = pdpConfig.welcomeOffer || {
    badgeText: 'WELCOME OFFER',
    offerText: 'Flat ₹100 OFF on 1st prepaid order'
  };

  const couponsList = (pdpConfig.coupons && pdpConfig.coupons.length > 0) ? pdpConfig.coupons : [
    { code: 'DIWALI200', title: 'Flat ₹200 OFF', subtitle: 'On Orders Above ₹1499', discount: 200, discountType: 'fixed' },
    { code: 'SAVE100', title: 'Flat ₹100 OFF', subtitle: 'On Orders Above ₹999', discount: 100, discountType: 'fixed' },
    { code: 'WELCOME10', title: '10% OFF', subtitle: 'On All First Orders', discount: 10, discountType: 'percent' }
  ];

  const trustBoxes = (pdpConfig.trustBoxes && pdpConfig.trustBoxes.length > 0) ? pdpConfig.trustBoxes : [
    { title: '100% Cashback', subtitle: 'up to ₹500 via UPI', icon: 'cashback' },
    { title: '6-Month', subtitle: 'Free replacement', icon: 'shield' },
    { title: 'Lab Certified', subtitle: '100% authentic', icon: 'award' },
    { title: 'Free Shipping', subtitle: 'on orders ₹499+', icon: 'truck' }
  ];

  const deliveryConfig = pdpConfig.deliveryEstimator || {
    title: 'Get estimated delivery date',
    subtitle: 'Prepaid orders are delivered on priority',
    perk1: '10% Off Every Prepaid Order',
    perk2: 'FREE Shipping on all orders',
    defaultDays: 3
  };

  // Currency Formatter (Defaults to INR ₹ or USD $)
  const currencySymbol = '₹';
  const formatPrice = (val) => `${currencySymbol}${Math.round(val || 0).toLocaleString('en-IN')}`;

  // Gallery Setup
  const galleryImages = (product.images && product.images.length > 0) 
    ? product.images 
    : [
        '/images/products/stylish-handbag.webp',
        '/images/sliderimage2.webp',
        '/images/sliderimage1.webp',
        '/images/offerbanner1.webp'
      ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  // Live Urgency Countdown Timer (ticking hh:mm:ss)
  const [timeLeft, setTimeLeft] = useState({
    hours: urgencyConfig.saleEndsHours || 12,
    minutes: urgencyConfig.saleEndsMinutes || 42,
    seconds: urgencyConfig.saleEndsSeconds || 31
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 42, seconds: 31 }; // Reset cycle
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pincode Delivery Estimator
  const [pincode, setPincode] = useState('110091');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  const calculateDeliveryDate = (code) => {
    setIsCheckingPincode(true);
    setTimeout(() => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (deliveryConfig.defaultDays || 3));
      const options = { weekday: 'long', day: 'numeric', month: 'short' };
      const formattedDate = targetDate.toLocaleDateString('en-US', options);
      setDeliveryResult({
        date: formattedDate,
        pincode: code || '110091',
        isFree: true
      });
      setIsCheckingPincode(false);
    }, 400);
  };

  useEffect(() => {
    calculateDeliveryDate('110091');
  }, []);

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.trim().length >= 4) {
      calculateDeliveryDate(pincode.trim());
    }
  };

  // Pricing calculations
  const isFavorited = isInWishlist(product._id);
  const currentPrice = Number(product.price) || 851;
  const comparePrice = Number(product.comparePrice) || Math.round(currentPrice * 1.17);
  const savings = Math.max(0, comparePrice - currentPrice);
  const discountPercent = comparePrice > currentPrice ? Math.round((savings / comparePrice) * 100) : 14;

  // Coupon Click to Copy Handler
  const handleCopyCoupon = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    try {
      localStorage.setItem('annsha_applied_coupon', code);
    } catch (e) {
      // ignore
    }
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  // Buy Now handler
  const handleBuyNowClick = () => {
    addToCart(product, quantity);
    if (onBuyNow) {
      onBuyNow();
    }
  };

  // Share handler
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#FAF5EE] min-h-screen pb-16 selection:bg-[#704214] selection:text-white">
      {/* Toast Notification when coupon is copied */}
      {copiedCoupon && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#28583B] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#3E8057] animate-bounce">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold font-sans">Coupon "{copiedCoupon}" Copied!</p>
            <p className="text-[11px] text-[#D0EADB]">Auto-applied at secure checkout</p>
          </div>
        </div>
      )}

      {/* 1. Breadcrumbs Bar */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-[#7A6E65] overflow-x-auto whitespace-nowrap">
            <button 
              onClick={onBack}
              className="hover:text-[#704214] font-medium transition-colors"
            >
              Home
            </button>
            <span className="text-[#A4978C]">&gt;</span>
            <button 
              onClick={() => onSelectCategory && onSelectCategory(product.category?.slug || '')}
              className="hover:text-[#704214] font-medium transition-colors"
            >
              {product.category?.name || 'Collections'}
            </button>
            <span className="text-[#A4978C]">&gt;</span>
            <span className="text-[#2B1E16] font-semibold truncate max-w-xs md:max-w-md">
              {product.title}
            </span>
          </nav>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#EADBCC] rounded-full text-xs text-[#605248] hover:bg-[#F5EBE1] shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-[#704214]" />
            <span>{isCopied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Showcase & Conversion Stack (Reference Image 1 & 2 Layout) */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================== */}
          {/* LEFT COLUMN: Main Showcase Image + Bottom Thumbnails Slider */}
          {/* ========================================================== */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            
            {/* Main Showcase Image Card */}
            <div className="w-full relative aspect-square max-h-[580px] rounded-3xl bg-white border border-[#EADBCC] p-6 sm:p-8 flex items-center justify-center overflow-hidden shadow-sm group">
              {/* Expand Fullscreen Button */}
              <button
                onClick={() => window.open(galleryImages[activeImageIndex] || product.images?.[0], '_blank')}
                className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm border border-[#EADBCC] text-[#704214] hover:bg-[#FAF5EE] flex items-center justify-center shadow-sm transition-all"
                title="Expand image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Wishlist Heart Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full border transition-all flex items-center justify-center shadow-sm ${
                  isFavorited 
                    ? 'bg-[#FDF0EE] text-[#B93822] border-[#F5C2BA]' 
                    : 'bg-white/95 text-[#7A6E65] border-[#EADBCC] hover:text-[#704214]'
                }`}
                title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>

              {/* Showcase Image with subtle hover zoom */}
              <img
                src={galleryImages[activeImageIndex] || product.images?.[0] || '/images/products/stylish-handbag.webp'}
                alt={product.title}
                className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Bottom Horizontal Thumbnails Slider (Directly below main image as in Reference Image 2) */}
            <div className="flex items-center gap-3 pt-1">
              <button 
                onClick={() => setActiveImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length)}
                className="w-8 h-8 rounded-full bg-white border border-[#EADBCC] flex items-center justify-center text-[#704214] hover:bg-[#FAF5EE] transition-all shadow-sm shrink-0"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 flex-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1.5 bg-white border transition-all shrink-0 overflow-hidden ${
                      activeImageIndex === idx 
                        ? 'border-[#28583B] ring-2 ring-[#28583B]/30 shadow-md scale-100' 
                        : 'border-[#EADBCC] opacity-80 hover:opacity-100 hover:border-[#704214]'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setActiveImageIndex(prev => (prev + 1) % galleryImages.length)}
                className="w-8 h-8 rounded-full bg-white border border-[#EADBCC] flex items-center justify-center text-[#704214] hover:bg-[#FAF5EE] transition-all shadow-sm shrink-0"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ========================================================== */}
          {/* RIGHT COLUMN: Conversion Stack (Reference Image 1 & 2)     */}
          {/* ========================================================== */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Title */}
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#2B1E16] leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Rating & Bestseller Badge */}
            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              <div className="flex items-center gap-1 text-[#E0A824]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-[#E0A824]" />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#6A5E55]">
                {urgencyConfig.ratingText || '4.87/5 Rated by 119 Verified Customers'}
              </span>
              {urgencyConfig.bestsellerBadge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#1E7E34] text-[11px] font-bold border border-[#CDEED5]">
                  <TrendingUp className="w-3 h-3" />
                  <span>Bestseller</span>
                </span>
              )}
            </div>

            {/* Live Urgency Badges Row: Eye live counter & Countdown Timer */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#EADBCC] shadow-sm text-xs font-semibold text-[#2B1E16]">
                <Eye className="w-3.5 h-3.5 text-[#28583B]" />
                <span>{urgencyConfig.viewingCount || 65} people viewing now</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#F5C2BA] shadow-sm text-xs font-semibold text-[#B93822]">
                <Clock className="w-3.5 h-3.5 text-[#B93822] animate-pulse" />
                <span>
                  Sale ends in{' '}
                  <strong className="font-mono font-bold">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </strong>
                </span>
              </div>
            </div>

            {/* Price Row: Bold current price, MRP strikethrough, discount badge, taxes */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#704214] tracking-tight">
                {formatPrice(currentPrice)}
              </span>
              {comparePrice > currentPrice && (
                <span className="text-base sm:text-lg text-[#8C7D73] line-through font-normal">
                  MRP {formatPrice(comparePrice)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="px-2.5 py-0.5 bg-[#D4EDDA] text-[#155724] border border-[#C3E6CB] rounded-md text-xs font-extrabold">
                  {discountPercent}% OFF
                </span>
              )}
              <span className="text-xs text-[#7A6E65] font-medium">
                (Incl. of all taxes)
              </span>
            </div>

            {/* Welcome Offer Banner */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EADBCC] flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-[#1E293B] text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                  {welcomeOfferConfig.badgeText || 'WELCOME OFFER'}
                </span>
                <span className="text-xs font-semibold text-[#2B1E16]">
                  {welcomeOfferConfig.offerText || 'Flat ₹100 OFF on 1st prepaid order'}
                </span>
              </div>

              {/* Payment brand badges */}
              <div className="flex items-center gap-1.5 opacity-90">
                <span className="px-2 py-0.5 rounded bg-white border border-[#EADBCC] text-[10px] font-bold text-[#5F259F]">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-white border border-[#EADBCC] text-[10px] font-bold text-[#002970]">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-white border border-[#EADBCC] text-[10px] font-bold text-[#28583B]">UPI</span>
              </div>
            </div>

            {/* Quantity Selector + Add to Cart Button */}
            <div className="flex items-center gap-3 pt-1">
              <div className="inline-flex items-center bg-white border border-[#EADBCC] rounded-xl px-2 py-1.5 shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#704214] hover:bg-[#FAF5EE] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-bold text-[#2B1E16] min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 20, quantity + 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#704214] hover:bg-[#FAF5EE] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 py-3 px-6 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl text-sm font-bold tracking-wide shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to cart</span>
              </button>
            </div>

            {/* Luxury BUY NOW Button (Clean luxury layout as requested by user - no Google pay logos inside) */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={handleBuyNowClick}
                className="w-full rounded-2xl overflow-hidden bg-[#1E6038] hover:bg-[#16482A] text-white shadow-lg transition-all active:scale-[0.99] group border border-[#16482A]"
              >
                {/* Top highlight bar */}
                <div className="bg-[#174D2D] py-1 text-center text-[10px] sm:text-[11px] font-bold tracking-wider text-[#A7F3D0] uppercase flex items-center justify-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#34D399]" />
                  <span>Extra Fast Shipping on Prepaid Orders</span>
                </div>

                {/* Main button row */}
                <div className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base sm:text-lg font-extrabold tracking-wide">
                      BUY NOW
                    </span>
                    <span className="text-white/80 group-hover:translate-x-1 transition-transform">→</span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {comparePrice > currentPrice && (
                        <span className="text-xs text-white/60 line-through">
                          {formatPrice(comparePrice * quantity)}
                        </span>
                      )}
                      <span className="text-base sm:text-lg font-extrabold text-white">
                        {formatPrice(currentPrice * quantity)}
                      </span>
                    </div>
                    {savings > 0 && (
                      <span className="text-[10px] font-bold text-[#A7F3D0] block">
                        Save {formatPrice(savings * quantity)}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              <p className="text-center text-[11px] sm:text-xs text-[#28583B] font-medium flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#28583B]" />
                <span>86% of customers choose Pay Online for faster, hassle-free delivery</span>
              </p>
            </div>

            {/* Interactive "Tap to Copy" Coupons Row (Reference Image 2) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {couponsList.map((coupon, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className="cursor-pointer border border-dashed border-[#D1B89D] hover:border-[#704214] rounded-2xl p-3 bg-white hover:bg-[#FFFDF9] transition-all shadow-sm shrink-0 min-w-[155px] text-center group"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#7A6E65] block">
                      Tap to Copy
                    </span>
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-[#704214] group-hover:underline">
                        {coupon.code}
                      </span>
                      <Copy className="w-3 h-3 text-[#A4978C] group-hover:text-[#704214]" />
                    </div>
                    <span className="text-[10px] text-[#28583B] font-bold block">
                      {coupon.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Pincode Delivery Estimator Container (Reference Image 2) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EADBCC] space-y-3.5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#2B1E16]">
                    {deliveryConfig.title || 'Get estimated delivery date'}
                  </h3>
                  <p className="text-[11px] text-[#7A6E65]">
                    {deliveryConfig.subtitle || 'Prepaid orders are delivered on priority'}
                  </p>
                </div>
              </div>

              {/* Input + Check button form */}
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-[#A4978C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-[#FAF5EE] border border-[#EADBCC] focus:border-[#28583B] focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCheckingPincode}
                  className="px-5 py-2 bg-[#28583B] hover:bg-[#1E452E] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {isCheckingPincode ? 'Checking...' : 'Check'}
                </button>
              </form>

              {/* Estimated Delivery Status */}
              {deliveryResult && (
                <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center gap-2 text-xs text-[#166534]">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>
                    Estimated Delivery by <strong>{deliveryResult.date}</strong> to {deliveryResult.pincode}
                  </span>
                </div>
              )}

              {/* Perks Row */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F5EBE1] text-[11px]">
                <div className="flex items-center gap-1.5 text-[#2B1E16] font-semibold">
                  <Percent className="w-3.5 h-3.5 text-[#28583B]" />
                  <span>{deliveryConfig.perk1 || '10% Off Every Prepaid Order'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#2B1E16] font-semibold">
                  <Truck className="w-3.5 h-3.5 text-[#28583B]" />
                  <span>{deliveryConfig.perk2 || 'FREE Shipping on all orders'}</span>
                </div>
              </div>
            </div>

            {/* 4 Trust Value Containers Grid (Reference Image 2) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {trustBoxes.map((box, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-2xl bg-white border border-[#EADBCC] shadow-sm flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0">
                    {idx === 0 && <ShieldCheck className="w-4 h-4" />}
                    {idx === 1 && <RotateCcw className="w-4 h-4" />}
                    {idx === 2 && <Award className="w-4 h-4" />}
                    {idx === 3 && <Truck className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2B1E16] leading-tight">{box.title}</p>
                    <p className="text-[10px] text-[#7A6E65]">{box.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* 3. Product Details & Specifications Bottom Section */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBCC] shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#2B1E16] border-b border-[#EADBCC] pb-3">
            Product Specifications &amp; Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-[#605248] leading-relaxed">
            <div className="space-y-3">
              <h3 className="font-bold text-[#2B1E16] text-sm">Description</h3>
              <p>
                {product.description || 'Crafted with premium materials and exquisite attention to detail, designed to bring beauty, positive energy, and timeless elegance into your home.'}
              </p>
              
              <div className="space-y-2 pt-2">
                {(product.features && product.features.length > 0 ? product.features : [
                  '100% Genuine and authenticated materials',
                  'Handcrafted with precision and durability',
                  'Carefully packaged in luxury presentation box'
                ]).map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#2B1E16]">
                    <Check className="w-3.5 h-3.5 text-[#28583B] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF5EE]">
                <span className="text-[#7A6E65] block text-[11px]">SKU Code</span>
                <strong className="text-[#2B1E16] font-mono">{product.sku || 'AG-PROD-101'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF5EE]">
                <span className="text-[#7A6E65] block text-[11px]">Weight</span>
                <strong className="text-[#2B1E16]">{product.weight || '0.85 kg'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF5EE]">
                <span className="text-[#7A6E65] block text-[11px]">Dimensions</span>
                <strong className="text-[#2B1E16]">{product.dimensions || '18 x 12 x 8 cm'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF5EE]">
                <span className="text-[#7A6E65] block text-[11px]">Material</span>
                <strong className="text-[#2B1E16]">{product.material || 'Premium Brass & Natural Crystal'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
