import React, { useState } from 'react';
import { Heart, Star, Eye, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product, onSelectProduct, onQuickView }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isFavorited = isInWishlist(product._id);

  // Calculate discount percentage
  const discountPct = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : (product.discount || null);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleOpenQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      setIsQuickViewOpen(true);
    }
  };

  return (
    <>
      <div className="group rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] p-3 sm:p-3.5 hover:border-[#704214]/40 hover:shadow-luxury transition-all duration-300 flex flex-col justify-between relative overflow-hidden">

        {/* Top-left: Discount Badge */}
        {discountPct && (
          <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 bg-[#B93822] text-white text-[10px] font-bold rounded-full shadow-sm">
            -{discountPct}%
          </div>
        )}

        {/* Top-right: Wishlist Heart & Quick View Eye */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
          {/* Wishlist Button */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-sm border border-[#EADBCC] flex items-center justify-center transition-all shadow-sm ${
              isFavorited ? 'text-[#B93822] bg-[#FDF0EE]' : 'text-[#7A6E65] hover:text-[#704214] hover:bg-white'
            }`}
            aria-label="Save to Wishlist"
            title="Wishlist"
          >
            <Heart className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          {/* Quick View Button */}
          <button
            onClick={handleOpenQuickView}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-sm border border-[#EADBCC] flex items-center justify-center text-[#7A6E65] hover:text-[#704214] hover:border-[#704214]/40 transition-all shadow-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-1 sm:group-hover:translate-x-0 duration-200"
            aria-label="Quick View"
            title="Quick View"
          >
            <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
        </div>

        {/* Product Image on Pedestal */}
        <div
          onClick={() => onSelectProduct && onSelectProduct(product)}
          className="w-full aspect-square rounded-xl bg-gradient-to-b from-[#FAF5EE] to-[#FFFDF9] p-3 sm:p-4 mb-2.5 flex items-center justify-center cursor-pointer overflow-hidden group-hover:scale-[1.02] transition-transform duration-300"
        >
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
            alt={product.title}
            className="w-full h-full object-contain drop-shadow-sm"
            loading="lazy"
          />
        </div>

        {/* Info Section */}
        <div className="space-y-1.5 flex-1 flex flex-col justify-between">
          <div>
            <h3
              onClick={() => onSelectProduct && onSelectProduct(product)}
              className="text-xs sm:text-sm font-semibold text-[#2B1E16] group-hover:text-[#704214] transition-colors line-clamp-1 cursor-pointer"
              title={product.title}
            >
              {product.title}
            </h3>

            {/* Stars & Reviews */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center text-[#C59B27]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(product.rating || 4.5) ? 'fill-current' : 'text-[#D9C8B5]'}`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-[#2B1E16]">
                {product.rating ? Number(product.rating).toFixed(1) : '4.5'}
              </span>
              <span className="text-[10px] text-[#8C7D73]">
                ({product.numReviews ? `${product.numReviews}k` : '12.5k'})
              </span>
            </div>
          </div>

          {/* Price Row */}
          <div className="pt-0.5 flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-[#2B1E16]">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.comparePrice > product.price && (
              <span className="text-xs text-[#8C7D73] line-through font-normal">
                ${Number(product.comparePrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2 sm:py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 ${
                addedToCart
                  ? 'bg-green-700 text-white'
                  : 'bg-[#704214] hover:bg-[#59330E] text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{addedToCart ? '✓ Added' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Self-Contained Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          onSelectProduct={onSelectProduct}
        />
      )}
    </>
  );
}
