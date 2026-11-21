import React from 'react';
import { X, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav({ isOpen, onClose, logoUrl, categories = [], onSelectCategory, onOpenAdmin, onSelectNav }) {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm bg-[#FFFDF9] h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-[#F0E7DB] flex items-center justify-between bg-[#FBF7F0]">
            <img
              src={logoUrl || '/images/logo.webp'}
              alt="annsha GIFTS"
              className="h-9 w-auto max-w-[160px] object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/logo.png';
              }}
            />
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#7A6E65] hover:bg-[#F5EBE1]"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info if logged in */}
          {user && (
            <div className="px-5 py-3 bg-[#FAF3EC] border-b border-[#F0E7DB]">
              <p className="font-semibold text-xs text-[#2B1E16]">{user.name}</p>
              <p className="text-[11px] text-[#7A6E65]">{user.email}</p>
              <p className="text-[10px] text-[#704214] mt-0.5">📍 {user.city}, {user.country}</p>
            </div>
          )}

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <h4 className="text-[10px] font-bold tracking-wider text-[#A4978C] uppercase mb-2 px-2">
              Categories
            </h4>
            <button
              onClick={() => { onSelectCategory(null); onClose(); }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-[#704214] hover:bg-[#F5EBE1] flex items-center justify-between"
            >
              <span>All Collections</span>
              <ChevronRight className="w-4 h-4 text-[#A4978C]" />
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => { onSelectCategory(cat.slug); onClose(); }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-[#2B1E16] hover:bg-[#F5EBE1] flex items-center justify-between"
              >
                <span>{cat.name}</span>
                <span className="text-[10px] text-[#7A6E65] bg-[#F5EBE1] px-2 py-0.5 rounded-full">
                  {cat.productCount || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-[#F0E7DB] mx-4 my-2"></div>

          {/* Quick Links */}
          <div className="p-4 space-y-1 text-xs font-medium text-[#2B1E16]">
            <button
              onClick={() => { onSelectNav && onSelectNav('shop'); onClose(); }}
              className="w-full text-left px-3 py-2 hover:bg-[#F5EBE1] rounded-xl font-medium"
            >
              Shop All Products
            </button>
            <button
              onClick={() => { onSelectNav && onSelectNav('flash_deals'); onClose(); }}
              className="w-full text-left px-3 py-2 hover:bg-[#F5EBE1] rounded-xl font-medium"
            >
              Flash Deals
            </button>
            <button
              onClick={() => { onSelectNav && onSelectNav('our_collection'); onClose(); }}
              className="w-full text-left px-3 py-2 hover:bg-[#F5EBE1] rounded-xl font-medium"
            >
              Our Collection
            </button>
            <button
              onClick={() => { onSelectNav && onSelectNav('our_brand'); onClose(); }}
              className="w-full text-left px-3 py-2 hover:bg-[#F5EBE1] rounded-xl font-medium"
            >
              Our Brand
            </button>
            <button
              onClick={() => { onSelectNav && onSelectNav('blogs'); onClose(); }}
              className="w-full text-left px-3 py-2 hover:bg-[#F5EBE1] rounded-xl font-medium"
            >
              Blogs & Articles
            </button>
            <button
              onClick={() => { onSelectNav && onSelectNav('faq'); onClose(); }}
              className="w-full text-left px-3 py-2 hover:bg-[#F5EBE1] rounded-xl font-medium"
            >
              FAQ & Shipping
            </button>
            <button
              onClick={() => { onSelectNav && onSelectNav('contact'); onClose(); }}
              className="w-full text-left px-3 py-2 hover:bg-[#F5EBE1] rounded-xl font-medium"
            >
              Contact Us
            </button>

            {/* Admin CMS Access Button */}
            <button
              onClick={() => { onClose(); if (onOpenAdmin) onOpenAdmin(); }}
              className="w-full text-left px-3 py-2.5 bg-[#FAF3EC] text-[#704214] hover:bg-[#F5EBE1] rounded-xl font-bold flex items-center gap-2 mt-2"
            >
              <Shield className="w-4 h-4 text-[#C59B27]" />
              <span>Admin Management CMS</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#F0E7DB] bg-[#FBF7F0]">
          {user ? (
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full py-2.5 text-center text-xs font-bold text-[#B93822] bg-[#FFFDF9] border border-[#F0E7DB] rounded-full"
            >
              Sign Out
            </button>
          ) : (
            <p className="text-[11px] text-center text-[#7A6E65]">
              ANNSHA GLOBAL Luxury Marketplace
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

