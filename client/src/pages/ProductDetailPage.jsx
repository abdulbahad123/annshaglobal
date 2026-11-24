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
  CreditCard,
  Headphones,
  Gem,
  Gift,
  Tag,
  AlertCircle,
  MessageSquare,
  Send,
  UserCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function ProductDetailPage({ 
  product, 
  onBack, 
  onSelectProduct, 
  onSelectCategory,
  onShopBanner,
  allProducts = [], 
  onBuyNow,
  cmsConfig,
  onOpenAuthModal
}) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  // Active bottom tab state for Task 2
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'shipping' | 'returns' | 'reviews'

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

  // Coupons List matching Image 2 & Image 8 UI/UX (Dual-pill badge + ticket notches)
  const defaultCoupons = [
    { 
      code: 'NEW100', 
      badge: 'WELCOME', 
      offerText: 'Offer 🎁', 
      title: 'Flat ₹100 OFF', 
      subtitle: 'For New Customers Only', 
      discount: 100,
      minPurchaseAmount: 499,
      firstOrderOnly: true
    },
    { 
      code: 'DIWALI200', 
      badge: 'DIWALI', 
      offerText: 'Offer 💥', 
      title: 'Flat 200Rs OFF', 
      subtitle: 'For All Prepaid Orders', 
      discount: 200,
      minPurchaseAmount: 1499,
      firstOrderOnly: false
    },
    { 
      code: 'SAVE100', 
      badge: 'SPECIAL', 
      offerText: 'Offer ⚡', 
      title: 'Flat ₹100 OFF', 
      subtitle: 'On Orders Above ₹999', 
      discount: 100,
      minPurchaseAmount: 999,
      firstOrderOnly: false
    }
  ];

  // Dynamic live coupons fetched from backend database
  const [liveCoupons, setLiveCoupons] = useState([]);

  useEffect(() => {
    let isMounted = true;
    fetch('http://127.0.0.1:5000/api/v1/coupons')
      .then(r => r.json())
      .then(data => {
        if (isMounted && data?.success && data.coupons?.length > 0) {
          setLiveCoupons(data.coupons);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Filter out expired coupons or inactive ones dynamically (Task 1 auto-hide)
  const nowTime = new Date();
  const sourceCoupons = liveCoupons.length > 0 ? liveCoupons : (pdpConfig.coupons || defaultCoupons);
  const couponsList = sourceCoupons.filter(c => {
    if (c.isActive === false) return false;
    if (c.endDate && new Date(c.endDate) < nowTime) return false;
    if (c.startDate && new Date(c.startDate) > nowTime) return false;
    return true;
  });

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

  // Currency Formatter (Defaults to INR ₹)
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
        return { hours: 12, minutes: 42, seconds: 31 };
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
      const cleanCode = String(code || '').trim().replace(/\s+/g, '');
      const rules = deliveryConfig.coverageRules && deliveryConfig.coverageRules.length > 0 
        ? deliveryConfig.coverageRules 
        : [
            { country: 'Australia', code: 'AU', pinLength: 4, citiesLabel: 'Australia (Sydney, Melbourne, Brisbane, Perth, All Cities)', estimatedDays: 4, isFree: true },
            { country: 'India', code: 'IN', pinLength: 6, citiesLabel: 'India (Delhi / Pan-India Delivery)', estimatedDays: 3, isFree: true },
            { country: 'United States', code: 'US', pinLength: 5, citiesLabel: 'United States (All States & Metro Cities)', estimatedDays: 5, isFree: true }
          ];

      // Dynamic rule matching based on admin rules
      let matchedRule = rules.find(r => {
        if (r.pinLength && cleanCode.length === Number(r.pinLength) && /^\d+$/.test(cleanCode)) return true;
        if (r.pinPrefix && cleanCode.startsWith(r.pinPrefix)) return true;
        return false;
      });

      // Default smart country fallbacks (Australia 4-digit all-city, India 6-digit, US 5-digit)
      if (!matchedRule) {
        if (/^\d{4}$/.test(cleanCode)) {
          matchedRule = { country: 'Australia', citiesLabel: 'Australia (All Cities Covered)', estimatedDays: 4, isFree: true };
        } else if (/^\d{6}$/.test(cleanCode)) {
          matchedRule = { country: 'India', citiesLabel: 'Pan-India Priority Delivery', estimatedDays: 3, isFree: true };
        } else if (/^\d{5}$/.test(cleanCode)) {
          matchedRule = { country: 'USA', citiesLabel: 'United States Priority', estimatedDays: 5, isFree: true };
        }
      }

      if (matchedRule) {
        const leadDays = matchedRule.estimatedDays || deliveryConfig.defaultDays || 3;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + leadDays);
        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        const formattedDate = targetDate.toLocaleDateString('en-US', options);
        setDeliveryResult({
          valid: true,
          date: formattedDate,
          pincode: cleanCode,
          locationName: matchedRule.citiesLabel || matchedRule.country,
          country: matchedRule.country,
          isFree: true,
          leadDays
        });
      } else {
        setDeliveryResult({
          valid: false,
          pincode: cleanCode,
          message: `Delivery currently unavailable to postal code "${cleanCode}". Please contact our 24/7 concierge.`
        });
      }
      setIsCheckingPincode(false);
    }, 350);
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

  // Customer Reviews System State (Task 1)
  const [reviewsList, setReviewsList] = useState(product.reviews || []);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Sync reviews when product changes
  useEffect(() => {
    if (product?.reviews && product.reviews.length > 0) {
      setReviewsList(product.reviews);
    } else if (product?._id) {
      axiosClient.get(`/products/${product._id}/reviews`)
        .then(res => {
          if (res.success && res.reviews) setReviewsList(res.reviews);
        })
        .catch(() => {});
    }
  }, [product?._id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setReviewError('Please write your review comment.');
      return;
    }
    setIsSubmittingReview(true);
    setReviewError('');
    setReviewMsg('');
    try {
      const res = await axiosClient.post(`/products/${product._id}/reviews`, {
        rating: newRating,
        title: newTitle.trim(),
        comment: newComment.trim()
      });
      if (res.success) {
        setReviewsList(res.reviews || [res.review, ...reviewsList]);
        setReviewMsg('Thank you! Your verified customer review has been published.');
        setNewTitle('');
        setNewComment('');
        setNewRating(5);
        setTimeout(() => {
          setIsWritingReview(false);
          setReviewMsg('');
        }, 2500);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
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

      {/* 2. Main Product Showcase & Conversion Stack */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================== */}
          {/* LEFT COLUMN: Main Showcase Image + Bottom Thumbnails Slider */}
          {/* Sticky & Fixed on scroll: lg:sticky lg:top-24 self-start    */}
          {/* ========================================================== */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 self-start flex flex-col gap-3">
            
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

            {/* Bottom Horizontal Thumbnails Slider */}
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
          {/* RIGHT COLUMN: Conversion Stack                             */}
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

            {/* Live Urgency Badges Row */}
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

            {/* ======================================================== */}
            {/* Task 2: SINGLE ROW: Quantity Counter + Add to Cart + BUY NOW */}
            {/* ======================================================== */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Quantity Counter */}
                <div className="inline-flex items-center justify-between bg-white border border-[#CBD5E1] rounded-2xl px-2.5 py-1.5 shadow-sm h-12 shrink-0 min-w-[110px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-[#475569] hover:bg-[#F1F5F9] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-sm font-bold text-[#1E293B] min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 20, quantity + 1))}
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-[#475569] hover:bg-[#F1F5F9] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 h-12 px-5 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-2xl text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 sm:shrink"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to cart</span>
                </button>

                {/* BUY NOW Button */}
                <button
                  onClick={handleBuyNowClick}
                  className="flex-1 h-12 px-5 bg-[#1E6038] hover:bg-[#16482A] text-white rounded-2xl text-xs sm:text-sm font-extrabold tracking-wide shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border border-[#16482A] group shrink-0 sm:shrink"
                >
                  <Zap className="w-4 h-4 text-[#34D399] fill-current" />
                  <span className="font-serif uppercase">BUY NOW</span>
                  <span className="text-white/80 group-hover:translate-x-1 transition-transform">→</span>
                  <span className="text-xs font-semibold text-white/90 ml-1">
                    {formatPrice(currentPrice * quantity)}
                  </span>
                </button>
              </div>

              {/* Trust Micro-copy Line beneath Single Row */}
              <div className="flex flex-wrap items-center justify-between text-[11px] sm:text-xs text-[#28583B] pt-0.5 px-1 font-medium gap-2">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#1E6038]" />
                  <span>Extra Fast Shipping on Prepaid Orders</span>
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#1E6038]" />
                  <span>86% choose Pay Online for faster delivery</span>
                </span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* Task 1: Ticket Voucher COUPON Cards (Exact Image 8 UI/UX) */}
            {/* ======================================================== */}
            <div className="pt-2">
              <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2">
                {couponsList.map((coupon, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className="cursor-pointer bg-white rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex items-center p-3.5 sm:p-4 min-w-[310px] sm:min-w-[340px] shrink-0 relative overflow-hidden group select-none"
                  >
                    {/* Left Section of Ticket */}
                    <div className="flex-1 pr-3">
                      {/* Dual pill badge (e.g. [WELCOME | Offer 🎁]) */}
                      <div className="inline-flex items-center shadow-xs">
                        <span className="bg-[#EFF6FF] text-[#1E3A8A] font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-l-full border border-r-0 border-[#DBEAFE]">
                          {coupon.badge}
                        </span>
                        <span className="bg-[#EA580C] text-white font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-r-full -ml-0.5 flex items-center gap-1 shadow-sm">
                          {coupon.offerText}
                        </span>
                      </div>

                      {/* Main Title */}
                      <h4 className="font-sans text-base sm:text-lg font-black text-[#0F172A] mt-1.5 tracking-tight leading-tight">
                        {coupon.title}
                      </h4>

                      {/* Subtitle */}
                      <p className="text-[11px] sm:text-xs text-[#64748B] font-semibold mt-0.5">
                        {coupon.subtitle}
                      </p>

                      {/* Dynamic Eligibility Badges (Min Order & First Order Only) */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {coupon.minPurchaseAmount > 0 && (
                          <span className="text-[9px] sm:text-[10px] bg-[#F1F5F9] text-[#334155] px-1.5 py-0.5 rounded font-bold border border-[#E2E8F0]">
                            Min Order: ₹{coupon.minPurchaseAmount}
                          </span>
                        )}
                        {coupon.firstOrderOnly && (
                          <span className="text-[9px] sm:text-[10px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded font-bold border border-[#FDE68A]">
                            1st Order Only
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ticket Perforated Divider with Semicircular Notches */}
                    <div className="relative border-r-2 border-dashed border-[#CBD5E1] h-16 mx-2 flex items-center justify-center shrink-0">
                      {/* Top semicircular notch */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FAF5EE] rounded-full border border-[#CBD5E1]"></div>
                      {/* Bottom semicircular notch */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FAF5EE] rounded-full border border-[#CBD5E1]"></div>
                    </div>

                    {/* Right Section of Ticket */}
                    <div className="pl-2 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] sm:text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1">
                        {copiedCoupon === coupon.code ? 'COPIED! ✓' : 'TAP TO COPY'}
                      </span>

                      {/* Dashed orange pill with code and copy icon */}
                      <div className={`border-2 border-dashed ${copiedCoupon === coupon.code ? 'border-[#16A34A] bg-[#DCFCE7] text-[#16A34A]' : 'border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]'} px-3 py-1.5 rounded-xl font-black font-mono text-xs sm:text-sm flex items-center justify-center gap-1.5 group-hover:bg-[#FFEDD5] transition-colors shadow-sm`}>
                        <span>{coupon.code}</span>
                        {copiedCoupon === coupon.code ? (
                          <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#EA580C]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Pincode Delivery Estimator Container */}
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
                    placeholder="Enter Pincode / Postal Code (e.g. 2000, 110091)"
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
              {deliveryResult && deliveryResult.valid && (
                <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center gap-2 text-xs text-[#166534]">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>
                    Estimated Delivery by <strong>{deliveryResult.date}</strong> to {deliveryResult.locationName} ({deliveryResult.pincode})
                  </span>
                </div>
              )}
              {deliveryResult && !deliveryResult.valid && (
                <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-center gap-2 text-xs text-[#991B1B]">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{deliveryResult.message}</span>
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

            {/* 4 Trust Value Containers Grid */}
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

      {/* ========================================================== */}
      {/* Task 2: REVERTED BOTTOM SECTION (Matching Image 3)         */}
      {/* 1. 4 Trust Badges Horizontal Bar                          */}
      {/* 2. 2-Column Tabs (Details, Shipping, Returns) + Promo Card*/}
      {/* ========================================================== */}

      {/* 1. 4 Trust Badges Horizontal Bar (Image 3 Top Bar) */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#EADBCC] shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] flex items-center justify-center shrink-0 text-[#704214]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2B1E16]">Secure Payments</p>
              <p className="text-[10px] text-[#7A6E65]">100% Secure</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] flex items-center justify-center shrink-0 text-[#704214]">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2B1E16]">24/7 Support</p>
              <p className="text-[10px] text-[#7A6E65]">Dedicated Support</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] flex items-center justify-center shrink-0 text-[#704214]">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2B1E16]">Premium Quality</p>
              <p className="text-[10px] text-[#7A6E65]">Best in Class</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] flex items-center justify-center shrink-0 text-[#704214]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2B1E16]">Perfect Gift</p>
              <p className="text-[10px] text-[#7A6E65]">For Loved Ones</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Reverted Tabs (Left 7 cols) + Promotional Banner Card (Right 5 cols) (Image 3) */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Rich Tabs & Details (7 cols) */}
          <div className="lg:col-span-7 bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EADBCC] shadow-sm space-y-6">
            {/* Tab Strip */}
            <div className="flex items-center gap-8 border-b border-[#EADBCC] text-xs font-semibold overflow-x-auto whitespace-nowrap">
              {[
                { id: 'details', label: 'Product Details' },
                { id: 'shipping', label: 'Shipping & Delivery' },
                { id: 'returns', label: 'Return Policy' },
                { id: 'reviews', label: `Customer Reviews (${reviewsList.length > 0 ? reviewsList.length : (product.numReviews || 3)})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 transition-colors relative ${
                    activeTab === tab.id ? 'text-[#704214] font-bold' : 'text-[#7A6E65] hover:text-[#2B1E16]'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#704214] rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content: Details */}
            {activeTab === 'details' && (
              <div className="space-y-4 text-xs sm:text-sm text-[#605248] leading-relaxed">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#2B1E16] mb-1.5">
                    About This Product
                  </h3>
                  <p>
                    {product.description || 'Crafted with premium materials and exquisite attention to detail, designed to bring elegance and lasting value to your lifestyle.'}
                  </p>
                </div>

                {/* Features Checkmark List */}
                <div className="space-y-2 pt-2">
                  {(product.features && product.features.length > 0 ? product.features : [
                    'Premium genuine leather construction',
                    'Spacious multiple internal compartments',
                    'Stylish and versatile design',
                    'Durable gold-tone hardware with protective feet',
                    'Removable and adjustable crossbody strap'
                  ]).map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[#2B1E16]">
                      <div className="w-4 h-4 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0 text-[#2E7D32]">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Specifications Grid */}
                <div className="pt-4 border-t border-[#F0E7DB] grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF5EE]">
                    <span className="text-[#7A6E65] block text-[11px]">Weight</span>
                    <strong className="text-[#2B1E16]">{product.weight || '0.85 kg'}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF5EE]">
                    <span className="text-[#7A6E65] block text-[11px]">Dimensions</span>
                    <strong className="text-[#2B1E16]">{product.dimensions || '28 x 14 x 20 cm'}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF5EE]">
                    <span className="text-[#7A6E65] block text-[11px]">Material</span>
                    <strong className="text-[#2B1E16]">{product.material || '100% Genuine Italian Leather'}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF5EE]">
                    <span className="text-[#7A6E65] block text-[11px]">SKU Code</span>
                    <strong className="text-[#2B1E16] font-mono">{product.sku || 'AG-HB-303'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Shipping */}
            {activeTab === 'shipping' && (
              <div className="space-y-3 text-xs text-[#605248] leading-relaxed">
                <p>• <strong>Free Worldwide Shipping:</strong> Automatically applied to all orders above ₹499.</p>
                <p>• <strong>Estimated Delivery:</strong> 3-5 business days for major metropolitan areas; 5-7 days for regional locations.</p>
                <p>• <strong>Signature Packaging:</strong> Hand-packed in our signature Annsha Global luxury gift box with dust bag included.</p>
              </div>
            )}

            {/* Tab Content: Returns */}
            {activeTab === 'returns' && (
              <div className="space-y-3 text-xs text-[#605248] leading-relaxed">
                <p>• <strong>7-Day Return Guarantee:</strong> Return any unworn or undamaged item in original packaging for a 100% refund.</p>
                <p>• <strong>Free Return Pickup:</strong> We arrange complimentary courier pickup from your doorstep.</p>
                <p>• <strong>Instant Refund:</strong> Processed to your original payment method within 48 hours of inspection.</p>
              </div>
            )}

            {/* Tab Content: Reviews (Task 1: Full System with Login Gated Submission) */}
            {activeTab === 'reviews' && (
              <div className="space-y-4 text-xs">
                {/* Reviews Summary & Write a Review CTA */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5EE] border border-[#EADBCC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-serif text-[#2B1E16]">{product.rating || 4.8}</span>
                      <span className="text-xs text-[#7A6E65]">out of 5.0</span>
                    </div>
                    <div className="flex text-[#C59B27] mt-1 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating || 4.8) ? 'fill-current' : 'text-[#D0C0B0]'}`} />
                      ))}
                    </div>
                    <p className="text-[11px] text-[#7A6E65] mt-1 font-medium">
                      Based on {reviewsList.length} verified buyer reviews
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <span className="text-xs font-bold text-[#704214] bg-[#F5EBE1] px-3 py-1 rounded-full border border-[#E7DACD]">
                      ✓ 99% Customer Satisfaction
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsWritingReview(!isWritingReview)}
                      className="px-4 py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded-xl text-xs font-bold tracking-wide shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isWritingReview ? 'Close Form' : 'Write a Review'}</span>
                    </button>
                  </div>
                </div>

                {/* Review Submission Form (Gated: Only Logged-In Customers) */}
                {isWritingReview && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EADBCC] shadow-sm space-y-4 transition-all animate-fadeIn">
                    {user ? (
                      <form onSubmit={handleSubmitReview} className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-[#F0E7DB] pb-2">
                          <h4 className="font-serif text-sm font-bold text-[#2B1E16] flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-[#2E7D32]" />
                            <span>Verified Review by {user.name}</span>
                          </h4>
                          <span className="text-[10px] text-[#7A6E65]">{user.email}</span>
                        </div>

                        {reviewError && (
                          <div className="p-2.5 rounded-xl bg-[#FDF0EE] text-[#B93822] text-xs border border-[#F5C2BA]">
                            {reviewError}
                          </div>
                        )}

                        {reviewMsg && (
                          <div className="p-2.5 rounded-xl bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold border border-[#C8E6C9]">
                            {reviewMsg}
                          </div>
                        )}

                        {/* Star Rating Picker */}
                        <div>
                          <label className="text-[11px] font-bold text-[#605248] block mb-1">
                            Your Rating *
                          </label>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 hover:scale-110 transition-transform"
                                aria-label={`${star} Stars`}
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= (hoverRating || newRating)
                                      ? 'text-[#C59B27] fill-current'
                                      : 'text-[#D0C0B0]'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-[#704214] ml-2">
                              {newRating} / 5 Stars
                            </span>
                          </div>
                        </div>

                        {/* Review Headline / Title */}
                        <div>
                          <label className="text-[11px] font-bold text-[#605248] block mb-1">
                            Review Title (Optional)
                          </label>
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="e.g. Absolutely stunning quality and packaging!"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] text-[#2B1E16] focus:border-[#704214] focus:bg-white focus:outline-none"
                          />
                        </div>

                        {/* Review Comment */}
                        <div>
                          <label className="text-[11px] font-bold text-[#605248] block mb-1">
                            Your Detailed Review *
                          </label>
                          <textarea
                            rows="3"
                            required
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your experience regarding material quality, sizing, packaging, and delivery..."
                            className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF5EE] border border-[#EADBCC] text-[#2B1E16] focus:border-[#704214] focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsWritingReview(false)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6E65] hover:bg-[#FAF5EE] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="px-5 py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded-xl text-xs font-bold tracking-wide shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSubmittingReview ? 'Submitting...' : 'Post Customer Review'}</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Not Logged In Prompt */
                      <div className="text-center py-4 space-y-3">
                        <div className="w-10 h-10 rounded-full bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center mx-auto text-[#704214]">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-serif text-sm font-bold text-[#2B1E16]">
                            Customer Login Required
                          </h4>
                          <p className="text-[11px] text-[#7A6E65] max-w-sm mx-auto mt-0.5">
                            To ensure authentic feedback from genuine buyers, only logged-in customers can submit verified reviews.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenAuthModal) onOpenAuthModal('login');
                          }}
                          className="px-5 py-2.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-xl text-xs font-bold tracking-wide shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Sign In / Create Account to Review</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Existing Customer Reviews List */}
                <div className="space-y-3 pt-1">
                  {reviewsList.map((rev, idx) => (
                    <div
                      key={rev._id || idx}
                      className="p-4 rounded-2xl border border-[#F0E7DB] bg-white space-y-2 hover:border-[#EADBCC] transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center text-[#704214] font-bold text-[11px]">
                            {(rev.userName || 'Customer').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-[#2B1E16] block">{rev.userName || 'Verified Customer'}</span>
                            <span className="text-[10px] text-[#2E7D32] font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Verified Buyer
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] text-[#7A6E65]">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified Review'}
                        </span>
                      </div>

                      <div className="flex text-[#C59B27] gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < (rev.rating || 5) ? 'fill-current' : 'text-[#D0C0B0]'}`}
                          />
                        ))}
                      </div>

                      {rev.title && (
                        <h5 className="font-semibold text-xs text-[#2B1E16] pt-0.5">
                          {rev.title}
                        </h5>
                      )}

                      <p className="text-[#605248] text-xs leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Promotional Banner Card (5 cols) matching Image 3 */}
          <div className="lg:col-span-5">
            <div 
              onClick={() => onShopBanner && onShopBanner()}
              className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-cover bg-center cursor-pointer shadow-sm group transition-transform hover:scale-[1.01]"
              style={{ backgroundImage: `url('/images/offerbanner1.webp')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="text-xs font-bold tracking-widest uppercase text-[#F5EBE1]">Limited Offer</span>
                <h3 className="font-serif text-2xl font-bold leading-tight">
                  Fashion Sale Up to 70% OFF
                </h3>
                <p className="text-xs text-[#EADBCC]">Step into style with hand-picked seasonal arrivals.</p>
                <div className="pt-2">
                  <button className="px-5 py-2 bg-white text-[#2B1E16] rounded-full text-xs font-bold hover:bg-[#FAF5EE] transition-all shadow-md group-hover:px-6">
                    Shop the Sale →
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
