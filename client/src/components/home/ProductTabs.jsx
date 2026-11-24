import React, { useState, useMemo } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import { ProductGridShimmer } from '../common/Shimmer';

const ITEMS_PER_PAGE = 12; // 3 rows of 4 columns on desktop

export default function ProductTabs({ products = [], onSelectProduct, onViewAll, loading = false }) {
  const [activeTab, setActiveTab] = useState('todays_deals');
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    { id: 'todays_deals', label: "Today's Deals" },
    { id: 'top_rated', label: 'Top Rated' },
    { id: 'trending', label: 'Trending' },
    { id: 'new_arrivals', label: 'New Arrivals' }
  ];

  // Reset page when switching tabs
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  // Filter products by tab
  const tabProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    let filtered = [];
    if (activeTab === 'todays_deals') {
      filtered = products.filter(p => 
        p.badge === 'deal' || 
        p.badge === 'todays_deals' || 
        (Number(p.comparePrice) > Number(p.price)) ||
        p.isTodayDeal
      );
    } else if (activeTab === 'top_rated') {
      filtered = products.filter(p => 
        p.badge === 'top_rated' || 
        p.isTopRated || 
        Number(p.rating || 0) >= 4.5
      );
      filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (activeTab === 'trending') {
      filtered = products.filter(p => 
        p.badge === 'trending' || 
        p.isTrending || 
        p.isFeatured
      );
    } else if (activeTab === 'new_arrivals') {
      filtered = products.filter(p => 
        p.badge === 'new' || 
        p.badge === 'new_arrivals' || 
        p.isNewArrival
      );
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    // Fallback: If no products match the specific badge, gracefully display all products sorted for that intent
    return filtered.length > 0 ? filtered : products;
  }, [products, activeTab]);

  const totalPages = Math.max(1, Math.ceil(tabProducts.length / ITEMS_PER_PAGE));
  const currentProducts = tabProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-9">
      {/* Tabs Bar & View All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        {/* Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  isActive 
                    ? 'bg-[#704214] text-white ring-2 ring-[#704214]/20' 
                    : 'bg-white text-[#2B1E16] border border-[#EADBCC] hover:bg-[#FAF5EE]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* View All & Count */}
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <span className="text-xs text-[#7A6E65] font-medium hidden md:inline">
            Showing {currentProducts.length} of {tabProducts.length} items
          </span>
          <button
            onClick={() => onViewAll && onViewAll()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#704214] hover:text-[#59330E] transition-colors"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Cards Grid: 3 Rows on Desktop (4 columns x 3 rows = 12 items) */}
      {loading || products.length === 0 ? (
        <ProductGridShimmer count={12} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {currentProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}

      {/* Numbered Pagination (when > 12 products exist) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8 sm:pt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 600, behavior: 'smooth' });
            }}
            className="w-9 h-9 rounded-full border border-[#EADBCC] bg-white flex items-center justify-center text-xs font-bold disabled:opacity-40 hover:bg-[#FAF5EE] transition-all shadow-2xs"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            const isCurrent = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                onClick={() => {
                  setCurrentPage(pageNum);
                  window.scrollTo({ top: 600, behavior: 'smooth' });
                }}
                className={`w-9 h-9 rounded-full text-xs font-bold transition-all shadow-2xs ${
                  isCurrent 
                    ? 'bg-[#704214] text-white' 
                    : 'bg-white border border-[#EADBCC] text-[#2B1E16] hover:bg-[#FAF5EE]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 600, behavior: 'smooth' });
            }}
            className="w-9 h-9 rounded-full border border-[#EADBCC] bg-white flex items-center justify-center text-xs font-bold disabled:opacity-40 hover:bg-[#FAF5EE] transition-all shadow-2xs"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
