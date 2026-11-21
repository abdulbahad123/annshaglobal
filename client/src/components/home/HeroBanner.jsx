import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Gem, Truck, ShieldCheck, RotateCcw, Gift } from 'lucide-react';

export default function HeroBanner({ banners = [], valueProps = [], onShopNow }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultBanners = [
    {
      tagline: 'PREMIUM COLLECTION',
      title: 'Care, Style and Home,\nAll in One Place.',
      subtitle: 'Discover Premium Products with Unbeatable Deals.',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      imageUrl: '/images/sliderimage2.webp',
      badgeText: 'Live Beautifully'
    },
    {
      tagline: 'EXCLUSIVE ARRIVALS',
      title: 'Elegance & Grace,\nCrafted for You.',
      subtitle: 'Explore handcrafted accessories and bespoke perfumes.',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      imageUrl: '/images/sliderimage1.webp',
      badgeText: 'Live Beautifully'
    }
  ];

  const slides = (banners && banners.length > 0) ? banners : defaultBanners;
  const slide = slides[currentSlide] || slides[0] || defaultBanners[0];

  // Default Trust Badges matching Reference Image 2 pixel-by-pixel
  const defaultTrustBadges = [
    { title: 'Premium Quality', subtitle: 'Always', icon: 'gem' },
    { title: 'Free Shipping', subtitle: 'On Orders Above $50', icon: 'truck' },
    { title: 'Secure Payments', subtitle: '100% Secure', icon: 'shield' }
  ];

  const badges = (valueProps && valueProps.length >= 3) ? valueProps.slice(0, 3) : defaultTrustBadges;

  // Auto-play timer for slider (6 seconds)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-2 pb-5">
      {/* Hero Container: Border-free, Shadow-free, seamless luxury look matching Reference Image 2 */}
      <div 
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[400px] sm:min-h-[480px] lg:min-h-[540px] xl:min-h-[580px] flex items-center bg-[#FAF5EE] w-full border-0 shadow-none outline-none"
      >
        {/* Full-width High-Definition Slider Image Background */}
        <div 
          key={currentSlide}
          className="absolute inset-0 bg-cover bg-[position:85%_center] lg:bg-right transition-all duration-700 pointer-events-none"
          style={{ 
            backgroundImage: `url(${slide.imageUrl || '/images/sliderimage2.webp'})` 
          }}
        />

        {/* Dynamic Subtle Cream Gradient on Left for Flawless Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF5EE] via-[#FAF5EE]/75 to-transparent sm:via-[#FAF5EE]/50 sm:to-transparent pointer-events-none max-w-xl sm:max-w-2xl lg:max-w-3xl" />

        {/* Left Navigation Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#543824]/80 hover:bg-[#3D2314] text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>

        {/* Right Navigation Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#543824]/80 hover:bg-[#3D2314] text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
        </button>

        {/* Left Hero Content Area */}
        <div className="relative z-10 max-w-md sm:max-w-xl lg:max-w-2xl pl-8 sm:pl-14 lg:pl-20 xl:pl-24 pr-6 py-8 sm:py-12 space-y-3 sm:space-y-4">
          {/* Sparkle & Tagline matching Reference Image 2 */}
          <div className="inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#704214] uppercase">
              {slide.tagline || 'PREMIUM COLLECTION'}
            </span>
            <span className="w-8 h-[1px] bg-[#C59B27]"></span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl xl:text-[48px] font-bold text-[#2B1E16] leading-[1.14] whitespace-pre-line tracking-tight">
            {slide.title || 'Care, Style and Home,\nAll in One Place.'}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm lg:text-[15px] text-[#605248] max-w-xs sm:max-w-sm lg:max-w-md font-normal leading-relaxed">
            {slide.subtitle || 'Discover Premium Products with Unbeatable Deals.'}
          </p>

          {/* Shop Now Action Button */}
          <div className="pt-2 sm:pt-4">
            <button
              onClick={() => onShopNow && onShopNow(slide.buttonLink || '/shop')}
              className="inline-flex items-center gap-2 px-6 sm:px-9 py-2.5 sm:py-3.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm hover:shadow active:scale-95"
            >
              <span>{slide.buttonText || 'Shop Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 ${
                currentSlide === idx 
                  ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-[#704214] rounded-full' 
                  : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#C4B5A5] rounded-full hover:bg-[#704214]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 4 Trust Badges Horizontal Card Bar (Matching Reference Images 2, 4 & 9) */}
      <div className="mt-4 sm:mt-5 p-3.5 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-[#FAF5EE] flex items-center justify-center shrink-0 text-[#704214]">
            <Truck className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#2B1E16] leading-tight">Free Shipping</p>
            <p className="text-[10px] sm:text-xs text-[#7A6E65]">On All Orders</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-[#FAF5EE] flex items-center justify-center shrink-0 text-[#704214]">
            <ShieldCheck className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#2B1E16] leading-tight">Secure Payments</p>
            <p className="text-[10px] sm:text-xs text-[#7A6E65]">100% Secure</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-[#FAF5EE] flex items-center justify-center shrink-0 text-[#704214]">
            <RotateCcw className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#2B1E16] leading-tight">Easy Returns</p>
            <p className="text-[10px] sm:text-xs text-[#7A6E65]">Within 7 Days</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-[#FAF5EE] flex items-center justify-center shrink-0 text-[#704214]">
            <Gift className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#2B1E16] leading-tight">Exclusive Offers</p>
            <p className="text-[10px] sm:text-xs text-[#7A6E65]">Save More</p>
          </div>
        </div>
      </div>
    </section>
  );
}
