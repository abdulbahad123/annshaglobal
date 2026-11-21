import React from 'react';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function MobileBottomBar({ activeTab, onSelectTab, onOpenAuthModal }) {
  const { totalCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#F0E7DB] px-4 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${activeTab === 'home' ? 'text-[#704214]' : 'text-[#7A6E65]'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        {/* Shop */}
        <button
          onClick={() => onSelectTab('shop')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${activeTab === 'shop' ? 'text-[#704214]' : 'text-[#7A6E65]'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Shop</span>
        </button>

        {/* Wishlist */}
        <button
          onClick={() => onSelectTab('wishlist')}
          className={`flex flex-col items-center gap-1 py-1 relative transition-colors ${activeTab === 'wishlist' ? 'text-[#704214]' : 'text-[#7A6E65]'}`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 bg-[#704214] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {wishlistCount}
            </span>
          </div>
          <span className="text-[10px] font-semibold">Wishlist</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 py-1 relative text-[#7A6E65] hover:text-[#704214] transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 bg-[#704214] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {totalCount}
            </span>
          </div>
          <span className="text-[10px] font-semibold">Cart</span>
        </button>

        {/* Account */}
        <button
          onClick={() => onOpenAuthModal('account')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${activeTab === 'account' ? 'text-[#704214]' : 'text-[#7A6E65]'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Account</span>
        </button>
      </div>
    </div>
  );
}

