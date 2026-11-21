import React from 'react';
import { Truck, RotateCcw, Headphones, Facebook, Instagram, Youtube, Pin } from 'lucide-react';

export default function AnnouncementBar({ config }) {
  const bar = config?.announcementBar;
  if (bar && bar.enabled === false) return null;

  return (
    <div className="hidden md:block bg-[#FAF5EE] text-[#543824] text-xs py-2 px-4 border-b border-[#EADBCC] tracking-wide w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col md:flex-row justify-between items-center gap-2">
        {/* Left items matching Reference Image 2 */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 font-medium text-[#4A3221]">
            <Truck className="w-3.5 h-3.5 text-[#704214]" />
            <span>{bar?.shippingText || 'Free Shipping on Orders Above $50'}</span>
          </div>
          <span className="hidden sm:inline text-[#D9C8B5]">|</span>
          <div className="flex items-center gap-1.5 font-medium text-[#4A3221]">
            <RotateCcw className="w-3.5 h-3.5 text-[#704214]" />
            <span>{bar?.returnsText || 'Easy Returns Within 7 Days'}</span>
          </div>
          <span className="hidden md:inline text-[#D9C8B5]">|</span>
          <div className="hidden md:flex items-center gap-1.5 font-medium text-[#4A3221]">
            <Headphones className="w-3.5 h-3.5 text-[#704214]" />
            <span>{bar?.supportText || '24/7 Customer Support'}</span>
          </div>
        </div>

        {/* Right items - Social Icons matching Reference Image 2 */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#7A6E65] font-medium hidden sm:inline text-[11px]">Follow Us:</span>
          <div className="flex items-center gap-1.5">
            <a href={bar?.socialLinks?.facebook || '#'} target="_blank" rel="noreferrer" className="w-5 h-5 rounded-full hover:bg-[#EADBCC] text-[#704214] flex items-center justify-center transition-colors">
              <Facebook className="w-3 h-3 fill-current" />
            </a>
            <a href={bar?.socialLinks?.instagram || '#'} target="_blank" rel="noreferrer" className="w-5 h-5 rounded-full hover:bg-[#EADBCC] text-[#704214] flex items-center justify-center transition-colors">
              <Instagram className="w-3 h-3" />
            </a>
            <a href={bar?.socialLinks?.youtube || '#'} target="_blank" rel="noreferrer" className="w-5 h-5 rounded-full hover:bg-[#EADBCC] text-[#704214] flex items-center justify-center transition-colors">
              <Youtube className="w-3 h-3" />
            </a>
            <a href={bar?.socialLinks?.pinterest || '#'} target="_blank" rel="noreferrer" className="w-5 h-5 rounded-full hover:bg-[#EADBCC] text-[#704214] flex items-center justify-center transition-colors">
              <Pin className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
