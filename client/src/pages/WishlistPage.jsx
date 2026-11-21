import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistPage({ onSelectProduct, onShopNow }) {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddAllToCart = () => {
    wishlist.forEach(item => addToCart(item, 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0E7DB] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#704214] uppercase">
            YOUR SAVED SELECTIONS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16]">
            My Wishlist ({wishlist.length})
          </h1>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={handleAddAllToCart}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-semibold shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Move All to Shopping Bag</span>
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#2B1E16]">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-[#7A6E65] leading-relaxed">
            Tap the heart icon on any luxury piece to save it for later or compare selections.
          </p>
          <div className="pt-2">
            <button
              onClick={onShopNow}
              className="px-8 py-3 bg-[#704214] text-white rounded-full text-xs font-semibold shadow-sm"
            >
              Explore Collections
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] p-4 flex flex-col justify-between shadow-sm hover:shadow-luxury transition-all relative group"
            >
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-[#B93822] hover:bg-red-50 border border-[#EADBCC]"
                title="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div
                onClick={() => onSelectProduct && onSelectProduct(product)}
                className="aspect-square rounded-xl bg-[#FAF5EE] p-3 mb-3 flex items-center justify-center cursor-pointer"
              >
                <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-contain" />
              </div>

              <div className="space-y-2">
                <h4
                  onClick={() => onSelectProduct && onSelectProduct(product)}
                  className="font-semibold text-xs text-[#2B1E16] truncate cursor-pointer hover:text-[#704214]"
                >
                  {product.title}
                </h4>
                <p className="text-xs font-bold text-[#704214]">${Number(product.price).toFixed(2)}</p>

                <button
                  onClick={() => addToCart(product, 1)}
                  className="w-full py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-semibold tracking-wide shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

