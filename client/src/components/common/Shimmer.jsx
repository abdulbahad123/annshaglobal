import React from 'react';

export function CategoryShimmer({ count = 7 }) {
  return (
    <div className="flex items-center gap-4 sm:gap-6 overflow-hidden py-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col items-center shrink-0 w-28 sm:w-32 md:w-36 text-center animate-pulse">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full shimmer-box border-2 border-[#EADBCC] mb-2" />
          <div className="w-20 h-3.5 shimmer-box rounded-md mb-1.5" />
          <div className="w-12 h-2.5 shimmer-box rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function ProductCardShimmer() {
  return (
    <div className="rounded-3xl border border-[#EADBCC] bg-white p-4 space-y-3 animate-pulse shadow-xs">
      <div className="w-full h-48 sm:h-56 rounded-2xl shimmer-box" />
      <div className="space-y-2 pt-1">
        <div className="w-3/4 h-4 shimmer-box rounded-md" />
        <div className="w-1/2 h-3 shimmer-box rounded-md" />
        <div className="flex items-center justify-between pt-2">
          <div className="w-16 h-5 shimmer-box rounded-md" />
          <div className="w-20 h-8 shimmer-box rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridShimmer({ count = 8, cols = 4 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardShimmer key={i} />
      ))}
    </div>
  );
}
