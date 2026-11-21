import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap, ArrowRight } from 'lucide-react';
import ProductCard from '../components/home/ProductCard';

export default function FlashDealsPage({ products = [], onSelectProduct }) {
  // Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter deal products
  const dealProducts = products.filter(p => p.comparePrice > p.price);
  const displayProducts = dealProducts.length > 0 ? dealProducts : products;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Hero Banner with Countdown Clock */}
      <div className="rounded-3xl bg-gradient-to-r from-[#231710] via-[#352319] to-[#231710] text-[#FBF7F0] p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B93822] text-white text-xs font-bold rounded-full">
            <Flame className="w-4 h-4 fill-current animate-pulse" />
            <span>LIMITED TIME FLASH EVENT</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Exclusive Deals Up to 70% OFF
          </h1>
          <p className="text-xs sm:text-sm text-[#D9C8B5] max-w-md">
            Unbeatable prices on certified authentic luxury items. Stock is strictly capped and resets once the timer hits zero.
          </p>
        </div>

        {/* Live Timer Clock Boxes */}
        <div className="bg-[#FAF5EE]/10 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-[#C59B27]/40 flex items-center gap-3 sm:gap-4 shrink-0 shadow-lg">
          <div className="text-center">
            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#2B1E16] rounded-2xl flex items-center justify-center font-mono font-bold text-2xl sm:text-3xl text-[#C59B27] border border-[#C59B27]/30 shadow-inner">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-[#D9C8B5] mt-1 block uppercase tracking-wider font-semibold">Hours</span>
          </div>
          <span className="text-2xl font-bold text-[#C59B27] pb-4">:</span>
          <div className="text-center">
            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#2B1E16] rounded-2xl flex items-center justify-center font-mono font-bold text-2xl sm:text-3xl text-[#C59B27] border border-[#C59B27]/30 shadow-inner">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-[#D9C8B5] mt-1 block uppercase tracking-wider font-semibold">Minutes</span>
          </div>
          <span className="text-2xl font-bold text-[#C59B27] pb-4">:</span>
          <div className="text-center">
            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#2B1E16] rounded-2xl flex items-center justify-center font-mono font-bold text-2xl sm:text-3xl text-[#C59B27] border border-[#C59B27]/30 shadow-inner">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-[#D9C8B5] mt-1 block uppercase tracking-wider font-semibold">Seconds</span>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1E16]">
            Active Flash Specials ({displayProducts.length})
          </h2>
          <span className="text-xs text-[#704214] font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Fast Selling Out
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {displayProducts.map((p) => (
            <div key={p._id} className="flex flex-col justify-between">
              <ProductCard product={p} onSelectProduct={onSelectProduct} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

