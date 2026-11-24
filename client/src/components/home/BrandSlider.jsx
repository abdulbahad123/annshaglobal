import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function BrandSlider({ brands = [] }) {
  const scrollRef = useRef(null);

  const defaultBrands = [
    { 
      name: 'Nike', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nike.svg',
      fallbackText: 'NIKE'
    },
    { 
      name: 'Adidas', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adidas.svg',
      fallbackText: 'ADIDAS'
    },
    { 
      name: 'Apple', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apple.svg',
      fallbackText: 'APPLE'
    },
    { 
      name: 'Samsung', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/samsung.svg',
      fallbackText: 'SAMSUNG'
    },
    { 
      name: 'Puma', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/puma.svg',
      fallbackText: 'PUMA'
    },
    { 
      name: 'Zara', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/zara.svg',
      fallbackText: 'ZARA'
    },
    { 
      name: 'Gucci', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gucci.svg',
      fallbackText: 'GUCCI'
    },
    { 
      name: 'Cartier', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cartier.svg',
      fallbackText: 'CARTIER'
    },
    { 
      name: 'Rolex', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/rolex.svg',
      fallbackText: 'ROLEX'
    },
    { 
      name: 'Prada', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/prada.svg',
      fallbackText: 'PRADA'
    },
    { 
      name: 'Chanel', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/chanel.svg',
      fallbackText: 'CHANEL'
    },
    { 
      name: 'H&M', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/handm.svg',
      fallbackText: 'H&M'
    },
    { 
      name: 'IKEA', 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ikea.svg',
      fallbackText: 'IKEA'
    },
    { 
      name: "Levi's", 
      logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/levis.svg',
      fallbackText: "LEVI'S"
    }
  ];

  const sourceBrands = (brands && brands.length > 0) ? brands : defaultBrands;
  // Duplicate for seamless infinite marquee loop
  const marqueeBrands = [...sourceBrands, ...sourceBrands];

  const handleManualScroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-9 select-none overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#C59B27]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#2B1E16] tracking-tight">
            Our Certified Luxury & Lifestyle Brands
          </h2>
          <span className="hidden sm:inline-block w-16 h-[1.5px] bg-[#C59B27]/60"></span>
        </div>

        {/* Manual Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleManualScroll(-300)}
            className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center text-[#704214] hover:bg-[#704214] hover:text-white transition-all shadow-2xs"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleManualScroll(300)}
            className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center text-[#704214] hover:bg-[#704214] hover:text-white transition-all shadow-2xs"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Infinite Smooth Auto-Scrolling Marquee Track */}
      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto no-scrollbar py-2"
      >
        <div className="animate-marquee gap-3.5 sm:gap-4 items-center">
          {marqueeBrands.map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="flex-shrink-0 w-28 sm:w-36 h-14 sm:h-16 rounded-2xl bg-white border border-[#EADBCC] px-4 py-2.5 flex items-center justify-center shadow-xs hover:shadow-md hover:border-[#704214]/50 transition-all hover:scale-105 cursor-pointer group"
            >
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="max-h-6 sm:max-h-8 max-w-[85px] sm:max-w-[100px] object-contain opacity-75 group-hover:opacity-100 transition-all filter grayscale group-hover:grayscale-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <span className="hidden font-serif text-xs font-bold tracking-widest text-[#704214] uppercase">
                {brand.fallbackText || brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
