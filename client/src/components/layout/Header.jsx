import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Header({ logoUrl, headerBg, onOpenMobileNav, onSearch, onOpenAuthModal, onOpenAdmin, onLogoClick, onOpenWishlist }) {
  const { user, logout, isAdmin } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  const activeHeaderBg = headerBg || '/images/Soft Ivory Wave Gradient.png';

  return (
    <header 
      className="border-b border-[#EADBCC] sticky top-0 z-40 w-full bg-cover bg-center bg-no-repeat shadow-xs"
      style={{
        backgroundImage: `url("${encodeURI(activeHeaderBg)}")`,
        backgroundColor: '#FAF5EE'
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-2.5 flex items-center justify-between gap-4">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 text-[#2B1E16] hover:bg-[#F0E7DB] rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Official annsha GIFTS Graphic Image Logo (Enlarged Luxury Size per Task 4) */}
          <button
            onClick={() => onLogoClick && onLogoClick()}
            className="flex items-center group text-left"
            aria-label="Annsha Gifts Home"
          >
            <img
              src={logoUrl || '/images/logo.webp'}
              alt="annsha GIFTS"
              className="h-11 sm:h-14 lg:h-16 w-auto max-w-[210px] sm:max-w-[290px] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/logo.png';
              }}
            />
          </button>
        </div>

        {/* Search Bar matching Reference Image (pill with brown round search button) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-xl mx-4 items-center relative"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for products..."
            className="w-full pl-5 pr-12 py-2.5 bg-[#FFFDF9] border border-[#E7DACD] rounded-full text-[15px] text-[#2B1E16] placeholder-[#A4978C] focus:outline-none focus:border-[#704214] focus:ring-1 focus:ring-[#704214] shadow-sm transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 w-8 h-8 rounded-full bg-[#704214] hover:bg-[#59330E] text-white flex items-center justify-center transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Navigation & Counters */}
        <div className="flex items-center gap-4 sm:gap-7">
          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-1.5 text-sm sm:text-[15px] font-semibold text-[#2B1E16] hover:text-[#704214] transition-colors py-1"
            >
              <UserIcon className="w-5 h-5 text-[#704214]" />
              <span className="hidden sm:inline">
                {user ? user.name.split(' ')[0] : 'Account'}
              </span>
              <svg className="w-3.5 h-3.5 text-[#7A6E65]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isAccountOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#FFFDF9] border border-[#F0E7DB] rounded-2xl shadow-xl py-2 z-50 text-xs">
                {user ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-[#F0E7DB]">
                      <p className="font-bold text-[#2B1E16] text-sm">{user.name}</p>
                      <p className="text-[#7A6E65] truncate text-[11px]">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#F5EBE1] text-[#704214] rounded-full text-[10px] font-semibold">
                        📍 {user.city || 'Verified Customer'}, {user.country || 'Global'}
                      </span>
                    </div>

                    <button
                      onClick={() => { setIsAccountOpen(false); if (onOpenWishlist) onOpenWishlist(); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F5EBE1] text-[#2B1E16] font-medium flex items-center justify-between"
                    >
                      <span>My Wishlist</span>
                      <span className="text-[10px] bg-[#FAF5EE] px-2 py-0.5 rounded-full text-[#704214] font-bold border border-[#EADBCC]">{wishlistCount}</span>
                    </button>

                    <button
                      onClick={() => { setIsAccountOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#FDF0EE] text-[#B93822] font-semibold border-t border-[#F0E7DB] mt-1"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setIsAccountOpen(false); onOpenAuthModal('login'); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F5EBE1] font-bold text-[#704214] flex items-center justify-between"
                    >
                      <span>Customer Sign In</span>
                      <span>→</span>
                    </button>
                    <button
                      onClick={() => { setIsAccountOpen(false); onOpenAuthModal('register'); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F5EBE1] text-[#2B1E16] font-medium"
                    >
                      Create Account
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Icon with Counter Badge */}
          <button
            onClick={() => onOpenWishlist && onOpenWishlist()}
            className="flex items-center gap-1.5 text-sm sm:text-[15px] font-semibold text-[#2B1E16] hover:text-[#704214] transition-colors relative"
            aria-label="Wishlist"
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-[#2B1E16]" />
              <span className="absolute -top-1.5 -right-2 bg-[#704214] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            </div>
            <span className="hidden sm:inline">Wishlist</span>
          </button>

          {/* Cart Icon with Counter Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 text-sm sm:text-[15px] font-semibold text-[#2B1E16] hover:text-[#704214] transition-colors relative"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-[#2B1E16]" />
              <span className="absolute -top-1.5 -right-2 bg-[#704214] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalCount}
              </span>
            </div>
            <span className="hidden sm:inline">Cart</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Input Bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for products..."
            className="w-full pl-4 pr-11 py-2 bg-[#FFFDF9] border border-[#E7DACD] rounded-full text-sm placeholder-[#A4978C] focus:outline-none focus:border-[#704214]"
          />
          <button
            type="submit"
            className="absolute right-1 w-7 h-7 rounded-full bg-[#704214] text-white flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </header>
  );
}

