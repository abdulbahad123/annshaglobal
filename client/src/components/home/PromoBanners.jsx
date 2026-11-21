import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function PromoBanners({ promoData = {}, onShopBanner }) {
  const b1 = promoData?.banner1 || {
    title: 'Fashion Sale Up to 70% OFF',
    subtitle: 'Step into style',
    buttonText: 'Shop the Sale',
    buttonLink: '/shop',
    imageUrl: '/images/offerbanner1.webp'
  };

  const b2 = promoData?.banner2 || {
    title: 'Smart Home Smarter Living Up to 50% OFF',
    subtitle: 'Modern comfort',
    buttonText: 'Shop Smart',
    buttonLink: '/shop',
    imageUrl: '/images/offerbanner2.webp'
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-5 sm:py-7">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
        {/* Banner 1 - Fashion Sale */}
        <div 
          className="relative overflow-hidden rounded-3xl border border-[#EADBCC] shadow-luxury min-h-[240px] sm:min-h-[280px] lg:min-h-[320px] xl:min-h-[350px] flex items-center bg-[#FAF5EE]"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center sm:bg-right transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url(${b1.imageUrl || '/images/offerbanner1.webp'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF5EE]/95 via-[#FAF5EE]/75 to-transparent pointer-events-none max-w-xs sm:max-w-sm lg:max-w-md" />

          <div className="relative z-10 max-w-[65%] sm:max-w-[55%] p-6 sm:p-8 lg:p-10 space-y-2 sm:space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#2B1E16] leading-tight">
              {b1.title}
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#7A6E65]">
              {b1.subtitle}
            </p>
            <div className="pt-1 sm:pt-2">
              <button
                onClick={() => onShopBanner && onShopBanner(b1.buttonLink || '/shop')}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 sm:py-3 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95"
              >
                <span>{b1.buttonText || 'Shop the Sale'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Banner 2 - Smart Home */}
        <div 
          className="relative overflow-hidden rounded-3xl border border-[#EADBCC] shadow-luxury min-h-[240px] sm:min-h-[280px] lg:min-h-[320px] xl:min-h-[350px] flex items-center bg-[#FAF5EE]"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center sm:bg-right transition-transform duration-700 pointer-events-none"
            style={{ backgroundImage: `url(${b2.imageUrl || '/images/offerbanner2.webp'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF5EE]/95 via-[#FAF5EE]/75 to-transparent pointer-events-none max-w-xs sm:max-w-sm lg:max-w-md" />

          <div className="relative z-10 max-w-[65%] sm:max-w-[55%] p-6 sm:p-8 lg:p-10 space-y-2 sm:space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#2B1E16] leading-tight">
              {b2.title}
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-[#7A6E65]">
              {b2.subtitle}
            </p>
            <div className="pt-1 sm:pt-2">
              <button
                onClick={() => onShopBanner && onShopBanner(b2.buttonLink || '/shop')}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 sm:py-3 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95"
              >
                <span>{b2.buttonText || 'Shop Smart'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
