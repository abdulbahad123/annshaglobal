import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import categoryBg from '../../images/categorbackground.png';

export default function CategoryCards({ categories = [], onSelectCategory }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Filter out "Spiritual & Artisan Decor" per Task 2 instruction
  const displayCategories = (categories && categories.length > 0 ? categories : []).filter(cat => {
    const slug = (cat.slug || '').toLowerCase();
    const name = (cat.name || '').toLowerCase();
    return !slug.includes('spiritual') && !name.includes('spiritual');
  });

  const checkScrollLimits = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  // Manual Slide Handler (Smooth manual slide left/right)
  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -260 : 260;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkScrollLimits, 350);
  };

  // Auto Smooth Slide Timer (advances smoothly every 3.2s, pauses on hover)
  useEffect(() => {
    if (isPaused || displayCategories.length <= 4) return;
    const timer = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
      }
      checkScrollLimits();
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused, displayCategories.length]);

  return (
    <section 
      className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header with Title and Left/Right Slide Controls */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1E16] tracking-tight">
            Shop by Category
          </h2>
          <span className="hidden sm:inline-block w-12 h-[1px] bg-[#C59B27]"></span>
        </div>

        {/* Right Controls: Left/Right Carousel Controls + View All */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Manual Left Slide Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shadow-xs ${
              canScrollLeft 
                ? 'bg-white border-[#EADBCC] text-[#704214] hover:bg-[#FAF5EE] hover:border-[#704214] active:scale-95' 
                : 'bg-white/60 border-[#F0E7DB] text-[#D0C0B0] cursor-not-allowed'
            }`}
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Manual Right Slide Button */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shadow-xs ${
              canScrollRight 
                ? 'bg-white border-[#EADBCC] text-[#704214] hover:bg-[#FAF5EE] hover:border-[#704214] active:scale-95' 
                : 'bg-white/60 border-[#F0E7DB] text-[#D0C0B0] cursor-not-allowed'
            }`}
            aria-label="Next categories"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectCategory && onSelectCategory(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#704214] hover:text-[#59330E] transition-colors ml-2"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto Smooth Slide & Manual Scroll Carousel Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollLimits}
        className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {displayCategories.map((cat) => (
          <div
            key={cat._id}
            onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
            className="group/card cursor-pointer rounded-2xl border border-[#EADBCC] p-3 sm:p-3.5 text-center hover:border-[#704214]/60 hover:shadow-luxury transition-all duration-300 flex flex-col items-center justify-between overflow-hidden relative shadow-sm shrink-0 w-[165px] sm:w-[195px] lg:w-[215px] select-none"
            style={{
              backgroundImage: `url(${categoryBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              scrollSnapAlign: 'start'
            }}
          >
            {/* Category Image - Direct transparent placement over full background */}
            <div className="w-full aspect-square p-2 flex items-center justify-center relative overflow-hidden group-hover/card:scale-105 transition-transform duration-300">
              <img
                src={cat.image || '/images/categories/beauty-care.webp'}
                alt={cat.name}
                className="w-full h-full object-contain drop-shadow-md"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/categories/beauty-care.webp';
                }}
              />
            </div>

            {/* Category Title & Round Arrow Button Row with subtle frosted bar */}
            <div className="w-full flex items-center justify-between gap-1 pt-2 border-t border-[#704214]/15 bg-white/40 backdrop-blur-sm -mx-3.5 -mb-3.5 px-3 py-2 mt-2 rounded-b-2xl">
              <span className="text-xs font-bold text-[#2B1E16] group-hover/card:text-[#704214] transition-colors line-clamp-1 text-left">
                {cat.name}
              </span>

              {/* Dark Brown Circular Arrow Button */}
              <div className="w-6 h-6 rounded-full bg-[#593014] text-white flex items-center justify-center group-hover/card:bg-[#43230C] transition-colors shrink-0 shadow-sm">
                <ArrowRight className="w-3 h-3 group-hover/card:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
