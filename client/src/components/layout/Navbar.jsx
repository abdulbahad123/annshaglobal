import React, { useState } from 'react';
import { LayoutGrid, ChevronDown } from 'lucide-react';

export default function Navbar({ categories = [], headerBg, activeCategory, onSelectCategory, activeNav = 'home', onSelectNav }) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Filter out spiritual category consistent with Task 2
  const navCategories = categories.filter(c => 
    !c.slug?.includes('spiritual') && !c.name?.toLowerCase().includes('spiritual')
  );

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop', hasDropdown: false }, // Removed accordion / dropdown from Shop
    { id: 'blogs', label: 'Blogs' },
    { id: 'flash_deals', label: 'Flash Deals' },
    { id: 'our_brand', label: 'Our Brand' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const activeHeaderBg = headerBg || '/images/Soft Ivory Wave Gradient.png';

  return (
    <nav 
      className="hidden lg:block border-b border-[#F0E7DB] w-full bg-cover bg-center bg-no-repeat shadow-xs"
      style={{
        backgroundImage: `url("${encodeURI(activeHeaderBg)}")`,
        backgroundColor: '#FBF7F0'
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex items-center justify-between">
        <div className="flex items-center gap-8 xl:gap-10">
          {/* "All Categories" Dropdown Pill - Opens on HOVER */}
          <div 
            className="relative py-2.5"
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={() => setIsCategoryOpen(false)}
          >
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2.5 px-5 py-2.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-sm font-bold tracking-wide transition-colors shadow-sm"
            >
              <LayoutGrid className="w-4 h-4 text-[#F5EBE1]" />
              <span>All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && (
              <div 
                className="absolute left-0 mt-1 w-64 bg-[#FFFDF9] border border-[#F0E7DB] rounded-2xl shadow-xl py-2 z-50 animate-fadeIn"
                onMouseEnter={() => setIsCategoryOpen(true)}
                onMouseLeave={() => setIsCategoryOpen(false)}
              >
                <button
                  onClick={() => { onSelectCategory(null); setIsCategoryOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-[#F5EBE1] flex items-center justify-between ${!activeCategory ? 'text-[#704214] font-bold bg-[#FAF3EC]' : 'text-[#2B1E16]'}`}
                >
                  <span>All Collections</span>
                </button>
                {navCategories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => { onSelectCategory(cat.slug); setIsCategoryOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-[#F5EBE1] flex items-center justify-between ${activeCategory === cat.slug ? 'text-[#704214] font-bold bg-[#FAF3EC]' : 'text-[#2B1E16]'}`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-[#7A6E65] bg-[#F5EBE1] px-2 py-0.5 rounded-full font-semibold">
                      {cat.productCount || 0}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links with Increased Prominent Font Size (Task 1) */}
          <div className="flex items-center gap-7 xl:gap-9 text-sm sm:text-[15px] font-semibold tracking-wide">
            {navLinks.map((link) => {
              const isActive = activeNav === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectNav && onSelectNav(link.id)}
                  className={`py-4 transition-colors relative inline-flex items-center gap-1 ${isActive ? 'text-[#704214] font-bold' : 'text-[#2B1E16] hover:text-[#704214]'}`}
                >
                  <span>{link.label}</span>
                  {link.hasDropdown && <ChevronDown className="w-3.5 h-3.5 text-[#7A6E65]" />}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#704214] rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

