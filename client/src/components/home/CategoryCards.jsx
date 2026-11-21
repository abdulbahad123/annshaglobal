import React from 'react';
import { ArrowRight } from 'lucide-react';
import categoryBg from '../../images/categorbackground.png';

export default function CategoryCards({ categories = [], onSelectCategory }) {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1E16] tracking-tight">
            Shop by Category
          </h2>
          <span className="hidden sm:inline-block w-12 h-[1px] bg-[#C59B27]"></span>
        </div>

        <button
          onClick={() => onSelectCategory && onSelectCategory(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#704214] hover:text-[#59330E] transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6 Category Cards Grid - Each category container has FULL background image */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <div
            key={cat._id}
            onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
            className="group cursor-pointer rounded-2xl border border-[#EADBCC] p-3 sm:p-3.5 text-center hover:border-[#704214]/60 hover:shadow-luxury transition-all duration-300 flex flex-col items-center justify-between overflow-hidden relative shadow-sm"
            style={{
              backgroundImage: `url(${categoryBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Category Image - Direct transparent placement over full background */}
            <div className="w-full aspect-square p-2 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
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
              <span className="text-xs font-bold text-[#2B1E16] group-hover:text-[#704214] transition-colors line-clamp-1 text-left">
                {cat.name}
              </span>

              {/* Dark Brown Circular Arrow Button */}
              <div className="w-6 h-6 rounded-full bg-[#593014] text-white flex items-center justify-center group-hover:bg-[#43230C] transition-colors shrink-0 shadow-sm">
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
