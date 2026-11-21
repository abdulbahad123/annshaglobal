import React, { useState } from 'react';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ArrowLeft, 
  Share2, 
  Plus, 
  Minus, 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Headphones, 
  Gem, 
  Gift, 
  Tag, 
  Percent, 
  Play, 
  Check, 
  ChevronRight 
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
  onBuyNow 
}) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  // Variants & Gallery Setup
  const defaultColors = [
    { name: 'Beige', color: 'Beige', hex: '#E4CFBA', image: product.images?.[0] || '/images/products/stylish-handbag.webp' },
    { name: 'Purple', color: 'Purple', hex: '#C2A5D8', image: product.images?.[1] || '/images/sliderimage1.webp' },
    { name: 'Black', color: 'Black', hex: '#2B2B2B', image: product.images?.[2] || '/images/products/stylish-handbag.webp' },
    { name: 'Pink', color: 'Pink', hex: '#F3A7BD', image: product.images?.[3] || '/images/products/stylish-handbag.webp' }
  ];

  const colors = (product.variants && product.variants.length > 0) ? product.variants : defaultColors;
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const activeVariant = colors[selectedColorIndex] || colors[0];

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
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'shipping' | 'returns' | 'reviews'
  const [openAccordion, setOpenAccordion] = useState({ details: true, shipping: false, returns: false });
  const [isCopied, setIsCopied] = useState(false);

  const isFavorited = isInWishlist(product._id);
  const currentPrice = Number(product.price) || 69.99;
  const comparePrice = Number(product.comparePrice) || (currentPrice > 0 ? currentPrice * 1.4 : 99.99);
  const savings = Math.max(0, comparePrice - currentPrice);
  const discountPercent = comparePrice > currentPrice ? Math.round((savings / comparePrice) * 100) : 30;

  const handleColorSelect = (idx) => {
    setSelectedColorIndex(idx);
    if (colors[idx]?.image) {
      // Find matching image index or set first
      const foundIdx = galleryImages.findIndex(img => img === colors[idx].image);
      if (foundIdx !== -1) setActiveImageIndex(foundIdx);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleAccordionSection = (section) => {
    setOpenAccordion(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="bg-[#FAF5EE] min-h-screen pb-16 selection:bg-[#704214] selection:text-white">
      {/* 1. Breadcrumbs Bar (Single-line, cleanly aligned on all screen sizes) */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#7A6E65] overflow-x-auto no-scrollbar whitespace-nowrap py-1">
            <button 
              onClick={onBack}
              className="hover:text-[#704214] font-medium transition-colors shrink-0"
            >
              Home
            </button>
            <span className="text-[#A4978C]">&gt;</span>
            <button 
              onClick={() => onSelectCategory && onSelectCategory(product.category?.slug || '')}
              className="hover:text-[#704214] font-medium transition-colors shrink-0"
            >
              {product.category?.name || 'Shop'}
            </button>
            <span className="text-[#A4978C]">&gt;</span>
            <span className="text-[#2B1E16] font-semibold truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {product.title}
            </span>
          </nav>

          <button
            onClick={handleShare}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#EADBCC] rounded-full text-xs text-[#605248] hover:bg-[#F5EBE1] shadow-sm transition-colors shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 text-[#704214]" />
            <span>{isCopied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Showcase Container - Balanced Height */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF5EE] rounded-3xl p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* LEFT COLUMN: Gallery Showcase (6 cols on lg, balanced height) */}
            <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-3 sm:gap-4 items-center md:items-start">
              
              {/* Desktop Vertical Thumbnail Rail (Hidden on mobile) */}
              <div className="hidden md:flex flex-col items-center gap-2">
                <button 
                  onClick={() => setActiveImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length)}
                  className="w-7 h-7 rounded-full bg-white border border-[#EADBCC] flex items-center justify-center text-[#704214] hover:bg-[#F5EBE1] transition-colors shadow-sm"
                  aria-label="Previous thumbnail"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                <div className="flex flex-col gap-2">
                  {galleryImages.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl p-1.5 bg-white border transition-all shrink-0 overflow-hidden ${
                        activeImageIndex === idx 
                          ? 'border-[#704214] ring-2 ring-[#704214]/30 shadow-md' 
                          : 'border-[#EADBCC] opacity-80 hover:opacity-100 hover:border-[#704214]/50'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setActiveImageIndex(prev => (prev + 1) % galleryImages.length)}
                  className="w-7 h-7 rounded-full bg-white border border-[#EADBCC] flex items-center justify-center text-[#704214] hover:bg-[#F5EBE1] transition-colors shadow-sm"
                  aria-label="Next thumbnail"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Product Image Card - Height adjusted to match right side container */}
              <div className="flex-1 w-full relative h-[320px] sm:h-[400px] lg:h-[460px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FFFDF9] to-[#F5EBE1] border border-[#EADBCC] p-4 sm:p-6 flex items-center justify-center overflow-hidden shadow-sm">
                {/* Mobile Image Counter Badge */}
                <div className="md:hidden absolute top-3 right-3 z-10 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold rounded-full">
                  {activeImageIndex + 1}/{galleryImages.length}
                </div>

                {/* Mobile Video Play Button Icon */}
                <div className="md:hidden absolute bottom-3 left-3 z-10 w-8 h-8 rounded-full bg-[#704214]/85 text-white flex items-center justify-center shadow-md">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>

                {/* Desktop Expand Icon */}
                <button
                  onClick={() => window.open(galleryImages[activeImageIndex] || product.images?.[0], '_blank')}
                  className="hidden md:flex absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#EADBCC] text-[#704214] hover:bg-white items-center justify-center transition-all shadow-sm"
                  title="Expand image"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <img
                  src={galleryImages[activeImageIndex] || product.images?.[0] || '/images/products/stylish-handbag.webp'}
                  alt={product.title}
                  className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Mobile Horizontal Thumbnail Rail (Visible on mobile only) */}
            <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-1 -mt-2 w-full">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl p-1 bg-white border transition-all shrink-0 ${
                    activeImageIndex === idx 
                      ? 'border-[#704214] ring-2 ring-[#704214]/30 shadow-sm' 
                      : 'border-[#EADBCC] opacity-80'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* RIGHT COLUMN: Product Info & Purchase Controls (6 cols on lg) */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5">
              
              {/* Discount Pill Badge */}
              <div className="inline-block px-3 py-1 bg-[#704214] text-white text-[11px] font-bold rounded-md uppercase tracking-wider shadow-sm">
                {discountPercent}% OFF
              </div>

              {/* Product Title */}
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2B1E16] leading-tight">
                  {product.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#7A6E65] mt-1.5 leading-relaxed">
                  {product.subtitle || product.shortDescription || 'Elegant, stylish and spacious handbag for every occasion.'}
                </p>
              </div>

              {/* Rating & Authenticity Badge */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-[#C59B27]">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current text-[#C59B27]" />
                    ))}
                  </div>
                  <span className="font-bold text-[#2B1E16] ml-1">
                    {product.rating ? Number(product.rating).toFixed(1) : '4.5'}
                  </span>
                  <span className="text-[#7A6E65]">
                    ({product.numReviews ? Number(product.numReviews).toLocaleString() : '12,480'} Reviews)
                  </span>
                </div>
                <span className="text-[#D9C8B5]">|</span>
                <div className="flex items-center gap-1 text-[#704214] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#704214]" />
                  <span>100% Authentic</span>
                </div>
              </div>

              {/* Price & Savings Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-bold text-[#2B1E16]">
                  ${currentPrice.toFixed(2)}
                </span>
                {comparePrice > currentPrice && (
                  <span className="text-base sm:text-lg text-[#8C7D73] line-through font-normal">
                    ${comparePrice.toFixed(2)}
                  </span>
                )}
                {savings > 0 && (
                  <span className="px-2.5 py-0.5 bg-[#FAF3EC] text-[#704214] border border-[#EADBCC] rounded-full text-xs font-bold">
                    Save ${savings.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Available Offers Box (Matching Reference Images 4 & 5) */}
              <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADBCC] space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2B1E16]">
                    <Tag className="w-4 h-4 text-[#704214]" />
                    <span>Available Offers</span>
                  </div>
                  <button className="text-[11px] font-semibold text-[#704214] hover:underline flex items-center gap-0.5">
                    <span>View All</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#FAF5EE] border border-[#F0E7DB] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F5EBE1] flex items-center justify-center shrink-0 text-[#704214]">
                      <Percent className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2B1E16] leading-tight">Extra 10% OFF</p>
                      <p className="text-[9px] text-[#7A6E65]">On Prepaid Orders</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF5EE] border border-[#F0E7DB] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F5EBE1] flex items-center justify-center shrink-0 text-[#704214]">
                      <Truck className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2B1E16] leading-tight">Free Shipping</p>
                      <p className="text-[9px] text-[#7A6E65]">On All Orders</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF5EE] border border-[#F0E7DB] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#F5EBE1] flex items-center justify-center shrink-0 text-[#704214]">
                      <RotateCcw className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2B1E16] leading-tight">Easy Returns</p>
                      <p className="text-[9px] text-[#7A6E65]">Within 7 Days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Variants Swatches (Matching Reference Images 4 & 5) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#2B1E16]">
                    Color: <strong className="text-[#704214] font-bold">{activeVariant.name || activeVariant.color || 'Beige'}</strong>
                  </span>
                  {product.material && (
                    <span className="text-[11px] text-[#7A6E65] font-normal">
                      Material: {product.material}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {colors.map((c, idx) => {
                    const isSelected = selectedColorIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleColorSelect(idx)}
                        className={`w-8 h-8 rounded-full transition-all relative flex items-center justify-center ${
                          isSelected 
                            ? 'ring-2 ring-offset-2 ring-[#704214] scale-110 shadow-sm' 
                            : 'hover:scale-105 opacity-90 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex || '#E4CFBA' }}
                        title={c.name || c.color}
                        aria-label={`Select color ${c.name || c.color}`}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-white/70"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Counter & CTA Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#2B1E16]">Quantity:</span>
                  <div className="inline-flex items-center bg-white border border-[#EADBCC] rounded-full px-2 py-1 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[#704214] hover:bg-[#F5EBE1] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#2B1E16] min-w-[24px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 20, quantity + 1))}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[#704214] hover:bg-[#F5EBE1] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Wishlist Heart Button (Desktop & Mobile) */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`ml-auto p-2.5 rounded-full border transition-all flex items-center justify-center ${
                      isFavorited 
                        ? 'bg-[#FDF0EE] text-[#B93822] border-[#F5C2BA]' 
                        : 'bg-white text-[#7A6E65] border-[#EADBCC] hover:text-[#704214] shadow-sm'
                    }`}
                    title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-label="Wishlist toggle"
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    onClick={() => addToCart(product, quantity)}
                    className="flex-1 py-3 px-6 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                      if (onBuyNow) onBuyNow();
                    }}
                    className="flex-1 py-3 px-6 bg-white hover:bg-[#F5EBE1] text-[#704214] border-2 border-[#704214] rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ Buy Now</span>
                  </button>
                </div>
              </div>

              {/* Mobile Accordions for Product Info (Matching Reference Image 5) */}
              <div className="lg:hidden pt-4 space-y-2">
                {/* Accordion 1: Shipping & Delivery */}
                <div className="border border-[#EADBCC] rounded-2xl bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleAccordionSection('shipping')}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-[#2B1E16]"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#704214]" />
                      <span>Shipping &amp; Delivery</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#7A6E65] transition-transform ${openAccordion.shipping ? 'rotate-180' : ''}`} />
                  </button>
                  {openAccordion.shipping && (
                    <div className="px-4 pb-3 text-xs text-[#605248] space-y-1 border-t border-[#F5EBE1] pt-2">
                      <p>• Standard Express Delivery: 3-5 business days.</p>
                      <p>• Free shipping on orders above $50 worldwide.</p>
                      <p>• Real-time parcel tracking provided via SMS &amp; email.</p>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Product Details */}
                <div className="border border-[#EADBCC] rounded-2xl bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleAccordionSection('details')}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-[#2B1E16]"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#704214]" />
                      <span>Product Details</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#7A6E65] transition-transform ${openAccordion.details ? 'rotate-180' : ''}`} />
                  </button>
                  {openAccordion.details && (
                    <div className="px-4 pb-3 text-xs text-[#605248] space-y-2 border-t border-[#F5EBE1] pt-2">
                      <p>{product.description}</p>
                      <ul className="space-y-1">
                        {(product.features && product.features.length > 0 ? product.features : [
                          'Premium genuine leather construction',
                          'Spacious multiple internal compartments',
                          'Stylish and versatile design for day & night'
                        ]).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-[#2B1E16]">
                            <Check className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
                        <div><strong className="text-[#2B1E16]">Weight:</strong> {product.weight || '0.85 kg'}</div>
                        <div><strong className="text-[#2B1E16]">Dimensions:</strong> {product.dimensions || '28 x 14 x 20 cm'}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Return Policy */}
                <div className="border border-[#EADBCC] rounded-2xl bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleAccordionSection('returns')}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-[#2B1E16]"
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-[#704214]" />
                      <span>Return Policy</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#7A6E65] transition-transform ${openAccordion.returns ? 'rotate-180' : ''}`} />
                  </button>
                  {openAccordion.returns && (
                    <div className="px-4 pb-3 text-xs text-[#605248] space-y-1 border-t border-[#F5EBE1] pt-2">
                      <p>• 7-day hassle-free return window.</p>
                      <p>• 100% money-back guarantee on original packaging.</p>
                      <p>• Pre-paid return labels included with every luxury order.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 3. Luxury 4 Trust Badges Horizontal Bar (Matching Reference Images 4 & 5) */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {/* 4. Desktop Bottom Section: Tabs (60%) + Promo Banner Card (40%) (Matching Reference Image 4) */}
      <div className="hidden lg:block max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* Left: Rich Tabs & Details (7 cols) */}
          <div className="col-span-7 bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EADBCC] shadow-sm space-y-6">
            {/* Tab Strip */}
            <div className="flex items-center gap-8 border-b border-[#EADBCC] text-xs font-semibold">
              {[
                { id: 'details', label: 'Product Details' },
                { id: 'shipping', label: 'Shipping & Delivery' },
                { id: 'returns', label: 'Return Policy' },
                { id: 'reviews', label: `Customer Reviews (${product.numReviews ? Number(product.numReviews).toLocaleString() : '12,480'})` }
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
                    {product.description || 'Discover elegance and functionality with our premium leather handbag. Crafted with high-quality materials, this handbag is perfect for work, travel, and everyday use.'}
                  </p>
                </div>

                {/* Features Checkmark List */}
                <div className="space-y-2 pt-2">
                  {(product.features && product.features.length > 0 ? product.features : [
                    'Premium genuine leather',
                    'Spacious compartments',
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
                    <strong className="text-[#2B1E16] font-mono">{product.sku}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Shipping */}
            {activeTab === 'shipping' && (
              <div className="space-y-3 text-xs text-[#605248] leading-relaxed">
                <p>• <strong>Free Worldwide Shipping:</strong> Automatically applied to all orders above $50.</p>
                <p>• <strong>Estimated Delivery:</strong> 3-5 business days for major metropolitan areas; 5-7 days for international locations.</p>
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

            {/* Tab Content: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold font-serif text-[#2B1E16]">{product.rating || 4.5}</span>
                    <span className="text-xs text-[#7A6E65] ml-2">out of 5.0</span>
                    <div className="flex text-[#C59B27] mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#704214] block">99% Customer Satisfaction</span>
                    <span className="text-[10px] text-[#7A6E65]">Based on {product.numReviews ? Number(product.numReviews).toLocaleString() : '12,480'} verified reviews</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#F0E7DB] bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2B1E16]">Elena Rostova</span>
                    <span className="text-[10px] text-[#7A6E65]">Verified Buyer • 2 days ago</span>
                  </div>
                  <div className="flex text-[#C59B27]">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                  <p className="text-[#605248]">
                    "Absolutely breathtaking quality. The leather is buttery soft and the hardware has a satisfying, weighty feel. Worth every penny."
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Promotional Banner Card (5 cols) matching Reference Image 4 */}
          <div className="col-span-5">
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
