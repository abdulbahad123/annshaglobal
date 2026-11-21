import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer({ onCheckout }) {
  const {
    cartItems,
    totalCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 50.00;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#FFFDF9] h-full shadow-2xl flex flex-col justify-between z-10">
        {/* Header */}
        <div className="p-4 border-b border-[#F0E7DB] flex items-center justify-between bg-[#FBF7F0]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#704214]" />
            <span className="font-serif text-base font-bold text-[#2B1E16]">
              Your Shopping Bag ({totalCount})
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded-full text-[#7A6E65] hover:bg-[#F5EBE1]"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-3 bg-[#FAF3EC] border-b border-[#F0E7DB]">
          <div className="flex justify-between items-center text-xs font-medium text-[#2B1E16] mb-1.5">
            <span>
              {subtotal >= freeShippingThreshold
                ? '🎉 You unlocked Free Shipping!'
                : `Add $${(freeShippingThreshold - subtotal).toFixed(2)} more for Free Shipping`}
            </span>
            <span className="font-bold text-[#704214]">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#EADBCC] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#704214] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F5EBE1] flex items-center justify-center text-[#704214]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2B1E16]">Your cart is empty</h3>
              <p className="text-xs text-[#7A6E65] max-w-xs">
                Explore our luxury collections and add your favorite items to your bag.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-6 py-2.5 bg-[#704214] text-white rounded-full text-xs font-semibold"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-sm"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-[#FAF5EE] p-1.5 flex items-center justify-center shrink-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-[#2B1E16] truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs font-bold text-[#704214] mt-0.5">
                    ${Number(item.price).toFixed(2)}
                  </p>

                  {/* Quantity selector */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-[#EADBCC] rounded-full bg-white">
                      <button
                        onClick={() => updateQuantity(item.product, -1)}
                        className="p-1 hover:text-[#704214] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-[#2B1E16]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product, 1)}
                        className="p-1 hover:text-[#704214] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product)}
                      className="p-1 text-[#8C7D73] hover:text-[#B93822] transition-colors ml-auto"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-[#F0E7DB] bg-[#FBF7F0] space-y-3">
            <div className="flex justify-between items-center text-xs text-[#605248]">
              <span>Subtotal</span>
              <span className="font-bold text-sm text-[#2B1E16]">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-[#605248]">
              <span>Estimated Shipping</span>
              <span>{subtotal >= freeShippingThreshold ? 'FREE' : '$5.00'}</span>
            </div>
            <div className="border-t border-[#EADBCC] pt-2 flex justify-between items-center font-bold text-sm text-[#2B1E16]">
              <span>Estimated Total</span>
              <span className="text-base text-[#704214]">
                ${(subtotal + (subtotal >= freeShippingThreshold ? 0 : 5.00)).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                if (onCheckout) onCheckout();
              }}
              className="w-full py-3 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

