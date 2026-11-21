import React, { useState } from 'react';
import { X, Star, Heart, ShoppingCart, Check, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export default function QuickViewModal({ product, isOpen, onClose, onSelectProduct }) {
  if (!isOpen || !product) return null;

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeImage, setActiveImage] = useState(product.images?.[0] || '');
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isFavorited = isInWishlist(product._id);

  // Discount percentage calculation
  const discountPct = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant, selectedSize);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2200);
  };

  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.image || '/images/products/placeholder.webp'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-3xl bg-[#FFFDF9] rounded-2xl sm:rounded-3xl border border-[#EADBCC] shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-white/90 border border-[#EADBCC] text-[#7A6E65] hover:text-[#2B1E16] hover:bg-white flex items-center justify-center transition-all shadow-sm"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
            
            {/* Left: Image Showcase */}
            <div className="space-y-3">
              {/* Main Featured Image Container */}
              <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-b from-[#FAF5EE] to-[#FFFDF9] border border-[#F0E7DB] p-4 sm:p-6 flex items-center justify-center overflow-hidden">
                {discountPct && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#B93822] text-white text-[11px] font-bold rounded-full shadow-sm">
                    -{discountPct}% OFF
                  </span>
                )}
                
                <img
                  src={activeImage || images[0]}
                  alt={product.title}
                  className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                />

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full border border-[#EADBCC] flex items-center justify-center transition-all ${
                    isFavorited ? 'bg-[#FDF0EE] text-[#B93822]' : 'bg-white/90 text-[#7A6E65] hover:text-[#704214]'
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 bg-white p-1 transition-all ${
                        (activeImage || images[0]) === img ? 'border-[#704214] ring-2 ring-[#704214]/20' : 'border-[#F0E7DB] hover:border-[#D9C8B5]'
                      }`}
                    >
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Specifications & Add to Cart */}
            <div className="space-y-4">
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-[#7A6E65]">
                <span className="font-semibold text-[#704214] uppercase tracking-wider text-[11px]">
                  {product.category?.name || 'Exclusive Luxury'}
                </span>
                {product.sku && (
                  <span className="font-mono text-[10px] bg-[#FAF5EE] px-2 py-0.5 rounded border border-[#EADBCC]">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1E16] leading-snug">
                {product.title}
              </h2>

              {/* Stars & Reviews */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-[#C59B27]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 4.5) ? 'fill-current' : 'text-[#D9C8B5]'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#2B1E16]">
                  {product.rating ? Number(product.rating).toFixed(1) : '4.5'}
                </span>
                <span className="text-xs text-[#7A6E65]">
                  ({product.numReviews ? `${product.numReviews}k` : '12.8k'} reviews)
                </span>
                <span className="text-xs text-green-700 font-semibold ml-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> In Stock
                </span>
              </div>

              {/* Price Banner */}
              <div className="flex items-baseline gap-3 p-3 bg-[#FAF5EE] rounded-xl border border-[#F0E7DB]">
                <span className="font-serif text-2xl font-bold text-[#2B1E16]">
                  ${Number(product.price).toFixed(2)}
                </span>
                {product.comparePrice > product.price && (
                  <>
                    <span className="text-sm text-[#7A6E65] line-through">
                      ${Number(product.comparePrice).toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-[#B93822] bg-[#FDF0EE] px-2 py-0.5 rounded-full">
                      Save ${(product.comparePrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Description Snippet */}
              {product.subtitle && (
                <p className="text-xs text-[#605248] leading-relaxed">
                  {product.subtitle}
                </p>
              )}

              {/* Variants / Color Swatches */}
              {Array.isArray(product.variants) && product.variants.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#2B1E16] block">
                    Color: <span className="text-[#704214]">{selectedVariant?.name || selectedVariant?.color || 'Selected'}</span>
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedVariant(v)}
                        className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                          (selectedVariant?.name === v.name || selectedVariant?.color === v.color) 
                            ? 'border-[#704214] ring-2 ring-[#704214]/20 scale-110' 
                            : 'border-white shadow-sm hover:scale-105'
                        }`}
                        style={{ backgroundColor: v.hex || v.colorCode || '#E4CFBA' }}
                        title={v.name || v.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes Selection */}
              {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#2B1E16] block">
                    Size: <span className="text-[#704214]">{selectedSize}</span>
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {product.sizes.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedSize === s 
                            ? 'bg-[#704214] text-white shadow-sm' 
                            : 'bg-[#FAF5EE] text-[#605248] border border-[#EADBCC] hover:bg-[#F0E7DB]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-[#EADBCC] rounded-full bg-[#FAF5EE] overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-xs font-bold text-[#704214] hover:bg-[#F0E7DB] transition-colors"
                    >
                      −
                    </button>
                    <span className="px-3 text-xs font-bold text-[#2B1E16] min-w-[28px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-xs font-bold text-[#704214] hover:bg-[#F0E7DB] transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-2.5 px-5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${
                      addedSuccess 
                        ? 'bg-green-700 text-white' 
                        : 'bg-[#704214] hover:bg-[#59330E] text-white'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{addedSuccess ? '✓ Added to Cart!' : 'Add to Cart'}</span>
                  </button>
                </div>

                {/* View Full Details Button */}
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectProduct) onSelectProduct(product);
                  }}
                  className="w-full py-2 bg-transparent text-[#704214] hover:text-[#59330E] rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 hover:underline"
                >
                  <span>View Full Product Details &amp; Specifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-2 border-t border-[#F0E7DB] grid grid-cols-2 gap-2 text-[11px] text-[#7A6E65]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#704214]" />
                  <span>Free shipping over $50</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#704214]" />
                  <span>100% Genuine Guarantee</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

