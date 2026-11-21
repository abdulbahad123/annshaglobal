import React from 'react';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

function PinterestIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.94-.12-2.38.03-3.41l.9-3.83s-.23-.46-.23-1.14c0-1.07.62-1.87 1.4-1.87.66 0 .98.5.98 1.1 0 .67-.42 1.66-.64 2.58-.18.78.39 1.41 1.16 1.41 1.39 0 2.46-1.47 2.46-3.58 0-1.87-1.34-3.18-3.26-3.18-2.38 0-3.78 1.79-3.78 3.63 0 .72.28 1.49.62 1.91.07.08.08.15.06.24l-.23.97c-.04.15-.13.18-.3.11-1.11-.52-1.8-2.14-1.8-3.44 0-2.8 2.04-5.38 5.88-5.38 3.09 0 5.49 2.2 5.49 5.14 0 3.07-1.93 5.54-4.62 5.54-.9 0-1.75-.47-2.04-1.02l-.56 2.12c-.2 0.78-.74 1.75-1.1 2.34A12 12 0 1 0 12 0z" />
    </svg>
  );
}

export default function Footer({ config, logoUrl, onSelectNav, onSelectCategory, onOpenAdmin }) {
  const footerData = config?.footer;

  return (
    <footer 
      className="text-[#EFE7DD] pt-12 pb-6 border-t border-[#542B15] relative overflow-hidden"
      style={{ backgroundColor: '#3A1B0B' }}
    >
      {/* Subtle decorative gold leaf corner illustration matching Image 2 */}
      <div className="absolute right-0 bottom-0 pointer-events-none select-none opacity-25">
        <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
          <path d="M120 180 C130 130 170 100 220 90 C180 85 140 100 120 140 Z" fill="#C59B27" />
          <path d="M140 180 C160 140 190 120 220 120 C190 120 160 140 140 180 Z" fill="#D4AF37" />
          <path d="M170 180 C185 155 205 145 220 145 Z" fill="#E5C158" />
        </svg>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Main 5 Columns: 2 columns per row on mobile, 5 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-y-8 gap-x-4 sm:gap-x-6 lg:gap-0 pb-10 border-b border-[#542B15]">
          
          {/* Column 1: Brand Info & Logo (spans 2 columns on mobile for prominence) */}
          <div className="col-span-2 lg:col-span-1 space-y-4 lg:pr-6 lg:border-r border-[#542B15] pb-2 lg:pb-0">
            <button
              onClick={() => onSelectNav && onSelectNav('home')}
              className="flex items-center gap-3 text-left group"
            >
              <img
                src={logoUrl || '/images/logo.png'}
                alt="ANNSHA GLOBAL"
                className="h-10 sm:h-11 w-auto object-contain brightness-110 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/logo.png';
                }}
              />
            </button>

            <p className="text-xs text-[#C2B2A3] leading-relaxed max-w-sm">
              {footerData?.aboutText || 'Your one-stop destination for premium products and unique finds.'}
            </p>

            {/* Social Icons row */}
            <div className="flex items-center gap-2 pt-1">
              <a 
                href="#" 
                aria-label="Facebook"
                className="w-7 h-7 rounded-full bg-[#542B15] hover:bg-[#C59B27] hover:text-[#3A1B0B] text-[#EFE7DD] flex items-center justify-center transition-colors"
              >
                <Facebook className="w-3.5 h-3.5 fill-current" />
              </a>
              <a 
                href="#" 
                aria-label="Instagram"
                className="w-7 h-7 rounded-full bg-[#542B15] hover:bg-[#C59B27] hover:text-[#3A1B0B] text-[#EFE7DD] flex items-center justify-center transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="#" 
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-full bg-[#542B15] hover:bg-[#C59B27] hover:text-[#3A1B0B] text-[#EFE7DD] flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 fill-current" />
              </a>
              <a 
                href="#" 
                aria-label="Pinterest"
                className="w-7 h-7 rounded-full bg-[#542B15] hover:bg-[#C59B27] hover:text-[#3A1B0B] text-[#EFE7DD] flex items-center justify-center transition-colors"
              >
                <PinterestIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (Col 1 on mobile row 2) */}
          <div className="col-span-1 space-y-3 lg:px-6 lg:border-r border-[#542B15]">
            <h3 className="font-serif text-sm font-semibold text-white tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-[#C2B2A3]">
              <li><button onClick={() => onSelectNav && onSelectNav('home')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => onSelectNav && onSelectNav('shop')} className="hover:text-white transition-colors">Shop</button></li>
              <li><button onClick={() => onSelectNav && onSelectNav('blogs')} className="hover:text-white transition-colors">Blogs</button></li>
              <li><button onClick={() => onSelectNav && onSelectNav('our_collection')} className="hover:text-white transition-colors">Our Collection</button></li>
              <li><button onClick={() => onSelectNav && onSelectNav('our_brand')} className="hover:text-white transition-colors">Our Brand</button></li>
              <li><button onClick={() => onSelectNav && onSelectNav('contact')} className="hover:text-white transition-colors">Contact</button></li>
            </ul>
          </div>

          {/* Column 3: Customer Care (Col 2 on mobile row 2) */}
          <div className="col-span-1 space-y-3 lg:px-6 lg:border-r border-[#542B15]">
            <h3 className="font-serif text-sm font-semibold text-white tracking-wide">
              Customer Care
            </h3>
            <ul className="space-y-2 text-xs text-[#C2B2A3]">
              <li><button onClick={() => onSelectNav && onSelectNav('faq')} className="hover:text-white transition-colors">FAQs</button></li>
              <li><button onClick={() => onSelectNav && onSelectNav('faq')} className="hover:text-white transition-colors">Shipping Policy</button></li>
              <li><button onClick={() => onSelectNav && onSelectNav('faq')} className="hover:text-white transition-colors">Return Policy</button></li>
              <li><button onClick={() => onSelectNav && onSelectNav('faq')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onSelectNav && onSelectNav('faq')} className="hover:text-white transition-colors">Terms &amp; Conditions</button></li>
              <li><button onClick={() => onSelectNav && onSelectNav('contact')} className="hover:text-white transition-colors">Track Order</button></li>
            </ul>
          </div>

          {/* Column 4: Our Categories (Col 1 on mobile row 3) */}
          <div className="col-span-1 space-y-3 lg:px-6 lg:border-r border-[#542B15]">
            <h3 className="font-serif text-sm font-semibold text-white tracking-wide">
              Our Categories
            </h3>
            <ul className="space-y-2 text-xs text-[#C2B2A3]">
              <li><button onClick={() => onSelectCategory && onSelectCategory('fashion-wear')} className="hover:text-white transition-colors">Fashion &amp; Wear</button></li>
              <li><button onClick={() => onSelectCategory && onSelectCategory('electronics-gadgets')} className="hover:text-white transition-colors">Electronics</button></li>
              <li><button onClick={() => onSelectCategory && onSelectCategory('home-living')} className="hover:text-white transition-colors">Home &amp; Living</button></li>
              <li><button onClick={() => onSelectCategory && onSelectCategory('beauty-personal-care')} className="hover:text-white transition-colors">Beauty &amp; Care</button></li>
              <li><button onClick={() => onSelectCategory && onSelectCategory('sports-fitness')} className="hover:text-white transition-colors">Sports &amp; Fitness</button></li>
              <li><button onClick={() => onSelectCategory && onSelectCategory('gifts-more')} className="hover:text-white transition-colors">Gifts &amp; More</button></li>
            </ul>
          </div>

          {/* Column 5: Download Our App (Col 2 on mobile row 3) */}
          <div className="col-span-1 space-y-4 lg:pl-6">
            <h3 className="font-serif text-sm font-semibold text-white tracking-wide">
              Download Our App
            </h3>

            {/* Google Play & App Store buttons */}
            <div className="space-y-2">
              <div className="bg-[#201007] hover:bg-[#2C170B] px-3.5 py-2 rounded-xl flex items-center gap-3 border border-[#4D2713] cursor-pointer transition-colors">
                <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path d="M3.6 1.8l10.9 10.9-4.2 4.2-8.3-4.8c-.8-.5-1.3-1.3-1.3-2.3 0-.9.5-1.8 1.3-2.3l1.6-5.7zm11.9 11.9l2.7-2.7c.6-.6.6-1.5 0-2.1l-2.7-2.7-3.1 3.1 3.1 4.4z"/>
                </svg>
                <div className="leading-none text-left">
                  <span className="text-[8px] uppercase tracking-wider text-[#A8988C] block">Get it on</span>
                  <span className="text-xs font-bold text-white block mt-0.5">Google Play</span>
                </div>
              </div>

              <div className="bg-[#201007] hover:bg-[#2C170B] px-3.5 py-2 rounded-xl flex items-center gap-3 border border-[#4D2713] cursor-pointer transition-colors">
                <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path d="M18.7 19.5c-.8 1.2-1.7 2.4-3.1 2.5-1.3.1-1.8-.8-3.3-.8-1.5 0-2 .7-3.3.8-1.3.1-2.3-1.2-3.1-2.5-1.7-2.4-3-6.9-1.2-9.9.9-1.5 2.4-2.5 4-2.5 1.3 0 2.5.9 3.3.9.8 0 2.2-.9 3.7-.9 1.5 0 2.9.8 3.7 2-3.2 1.7-2.7 6.1.7 7.5-.7 1.8-1.6 3.6-2.7 5.4zM15.4 6.6c.7-.9 1.2-2.1 1-3.3-1.1.1-2.3.7-3 1.6-.6.8-1.2 2-1 3.2 1.2.1 2.3-.6 3-1.5z"/>
                </svg>
                <div className="leading-none text-left">
                  <span className="text-[8px] uppercase tracking-wider text-[#A8988C] block">Download on the</span>
                  <span className="text-xs font-bold text-white block mt-0.5">App Store</span>
                </div>
              </div>
            </div>

            {/* Accepted Payments Row matching Reference Image 2 */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-1 bg-white text-[#1A1F71] font-black text-[10px] rounded tracking-tight shadow-sm">
                  VISA
                </span>
                <span className="px-2 py-1 bg-white text-[#EB001B] font-bold text-[10px] rounded tracking-tight shadow-sm">
                  Mastercard
                </span>
                <span className="px-2 py-1 bg-white text-[#003087] font-bold text-[10px] rounded tracking-tight shadow-sm">
                  PayPal
                </span>
                <span className="px-2 py-1 bg-white text-[#635BFF] font-bold text-[10px] rounded tracking-tight shadow-sm">
                  stripe
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A8988C] gap-3">
          <p>{footerData?.copyrightText || '© 2025 Annsha Global. All rights reserved.'}</p>
          <div className="flex items-center gap-5">
            <button onClick={() => onSelectNav && onSelectNav('faq')} className="hover:text-white transition-colors">Privacy Policy</button>
            <span>|</span>
            <button onClick={() => onSelectNav && onSelectNav('faq')} className="hover:text-white transition-colors">Terms of Service</button>
            <span>|</span>
            <button onClick={() => onSelectNav && onSelectNav('faq')} className="hover:text-white transition-colors">Sitemap</button>
            {onOpenAdmin && (
              <>
                <span>|</span>
                <button onClick={onOpenAdmin} className="hover:text-[#C59B27] font-semibold text-[#C59B27] transition-colors">Admin Portal</button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
