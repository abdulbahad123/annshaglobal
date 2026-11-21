import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductTabs({ products = [], onSelectProduct, onViewAll }) {
  const [activeTab, setActiveTab] = useState('todays_deals');

  const tabs = [
    { id: 'todays_deals', label: "Today's Deals" },
    { id: 'top_rated', label: 'Top Rated' },
    { id: 'trending', label: 'Trending' },
    { id: 'new_arrivals', label: 'New Arrivals' }
  ];

  // Filter products by tab badge or show all if none match
  const filteredProducts = products.filter(p => {
    if (activeTab === 'todays_deals') return p.badge === 'todays_deals' || !p.badge || p.badge === 'none';
    return p.badge === activeTab;
  });

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products;

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-5 sm:py-7">
      {/* Tabs Bar & View All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${isActive ? 'bg-[#704214] text-white' : 'bg-[#FFFDF9] text-[#2B1E16] border border-[#EADBCC] hover:bg-[#F5EBE1]'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* View All Link */}
        <button
          onClick={() => onViewAll && onViewAll()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#704214] hover:text-[#59330E] transition-colors self-end sm:self-auto"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {displayProducts.slice(0, 6).map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </section>
  );
}

