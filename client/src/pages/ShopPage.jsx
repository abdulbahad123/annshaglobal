import React, { useState, useMemo } from 'react';
import { 
  Filter, X, Star, Grid3X3, LayoutList, ChevronLeft, ChevronRight, 
  SlidersHorizontal, Check, ShoppingCart, Truck, ShieldCheck, Headphones, Gift, RotateCcw
} from 'lucide-react';
import ProductCard from '../components/home/ProductCard';

const ITEMS_PER_PAGE = 12;

export default function ShopPage({
  products = [],
  categories = [],
  selectedCategory,
  onSelectCategory,
  onSelectProduct
}) {
  // Filter States
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Dynamic Price Calculations based on real products
  const { minProductPrice, maxProductPrice } = useMemo(() => {
    if (!products || products.length === 0) return { minProductPrice: 0, maxProductPrice: 500 };
    const prices = products.map(p => Number(p.price) || 0).filter(pr => pr > 0);
    if (prices.length === 0) return { minProductPrice: 0, maxProductPrice: 500 };
    return {
      minProductPrice: Math.floor(Math.min(...prices)),
      maxProductPrice: Math.ceil(Math.max(...prices))
    };
  }, [products]);

  const [priceRange, setPriceRange] = useState(maxProductPrice);
  const [appliedPriceMax, setAppliedPriceMax] = useState(maxProductPrice);

  // Update price range when products load
  React.useEffect(() => {
    if (maxProductPrice > 0) {
      setPriceRange(maxProductPrice);
      setAppliedPriceMax(maxProductPrice);
    }
  }, [maxProductPrice]);

  // Dynamic Category Extraction with Real Product Counts
  const dynamicCategories = useMemo(() => {
    const list = categories.filter(c => 
      !c.slug?.includes('spiritual') && !c.name?.toLowerCase().includes('spiritual')
    );
    return list.map(cat => {
      const count = products.filter(p => 
        p.category?.slug === cat.slug || 
        String(p.category?._id) === String(cat._id) ||
        (typeof p.category === 'string' && p.category.toLowerCase() === cat.name?.toLowerCase())
      ).length;
      return {
        ...cat,
        count: count || cat.productCount || 0
      };
    });
  }, [categories, products]);

  // Dynamic Brand Extraction with Real Product Counts
  const dynamicBrands = useMemo(() => {
    const brandMap = {};
    products.forEach(p => {
      let brandName = p.brand;
      if (!brandName && p.title) {
        // Extract brand name or key designer label
        const firstWord = p.title.trim().split(' ')[0];
        if (['Nike', 'Adidas', 'Puma', 'Apple', 'Samsung', 'Zara', 'Handcrafted', 'Italian', 'Collector', "L'Ambre"].includes(firstWord)) {
          brandName = firstWord;
        } else {
          brandName = 'Annsha Signature';
        }
      }
      if (brandName) {
        brandMap[brandName] = (brandMap[brandName] || 0) + 1;
      }
    });

    return Object.keys(brandMap).map(b => ({
      name: b,
      count: brandMap[b]
    })).sort((a, b) => b.count - a.count);
  }, [products]);

  // Dynamic Rating Counts
  const dynamicRatingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    products.forEach(p => {
      const r = Math.floor(Number(p.rating) || 4.5);
      if (r >= 5) counts[5]++;
      if (r >= 4) counts[4]++;
      if (r >= 3) counts[3]++;
      if (r >= 2) counts[2]++;
      if (r >= 1) counts[1]++;
    });
    return counts;
  }, [products]);

  // Real-time Dynamic Filter Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Filter by Category
    if (selectedCategory) {
      list = list.filter(p => 
        p.category?.slug === selectedCategory || 
        String(p.category?._id) === String(selectedCategory) ||
        p.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (typeof p.category === 'string' && p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }

    // 2. Filter by Brand
    if (selectedBrands.length > 0) {
      list = list.filter(p => {
        const brand = p.brand || p.title.trim().split(' ')[0];
        return selectedBrands.includes(brand) || (selectedBrands.includes('Annsha Signature') && !p.brand);
      });
    }

    // 3. Filter by Price
    list = list.filter(p => Number(p.price) <= appliedPriceMax);

    // 4. Filter by Rating
    if (minRating > 0) {
      list = list.filter(p => Number(p.rating || 4.5) >= minRating);
    }

    // 5. Filter by Stock
    if (inStockOnly) {
      list = list.filter(p => (Number(p.stock) || 0) > 0);
    }

    // 6. Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [products, selectedCategory, selectedBrands, appliedPriceMax, minRating, inStockOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const clearAllFilters = () => {
    onSelectCategory && onSelectCategory(null);
    setSelectedBrands([]);
    setPriceRange(maxProductPrice);
    setAppliedPriceMax(maxProductPrice);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('popular');
    setCurrentPage(1);
  };

  const toggleBrand = (brandName) => {
    setSelectedBrands(prev => 
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
    setCurrentPage(1);
  };

  // Reusable Sidebar Filter
  const FilterSidebar = () => (
    <aside className="space-y-6 select-none">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#EADBCC]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#704214]" />
          <h2 className="font-serif text-lg font-bold text-[#2B1E16]">Filters</h2>
        </div>
        <button
          onClick={clearAllFilters}
          className="text-xs font-semibold text-[#704214] hover:underline transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* 1. Dynamic Categories List */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-xs sm:text-sm text-[#2B1E16] uppercase tracking-wider">
          Categories
        </h3>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <label 
            onClick={() => { onSelectCategory && onSelectCategory(null); setCurrentPage(1); }}
            className={`flex items-center justify-between cursor-pointer px-2 py-1.5 rounded-lg text-xs transition-colors ${
              !selectedCategory ? 'bg-[#FAF5EE] text-[#704214] font-bold' : 'text-[#504136] hover:bg-[#FAF5EE]/60'
            }`}
          >
            <span>All Categories</span>
            <span className="text-[11px] text-[#7A6E65] bg-white px-2 py-0.5 rounded-full border border-[#EADBCC]">
              {products.length}
            </span>
          </label>
          {dynamicCategories.map((cat) => {
            const isChecked = selectedCategory === cat.slug || String(selectedCategory) === String(cat._id);
            return (
              <label 
                key={cat._id || cat.slug}
                onClick={() => {
                  onSelectCategory && onSelectCategory(isChecked ? null : cat.slug);
                  setCurrentPage(1);
                }}
                className={`flex items-center justify-between cursor-pointer px-2 py-1.5 rounded-lg text-xs transition-colors ${
                  isChecked ? 'bg-[#FAF5EE] text-[#704214] font-bold' : 'text-[#504136] hover:bg-[#FAF5EE]/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                    isChecked ? 'bg-[#704214] border-[#704214] text-white' : 'border-[#C4B5A5]'
                  }`}>
                    {isChecked ? '✓' : ''}
                  </div>
                  <span className="truncate max-w-[140px]">{cat.name}</span>
                </div>
                <span className="text-[11px] text-[#7A6E65]">({cat.count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Dynamic Price Slider */}
      <div className="space-y-3 pt-3 border-t border-[#EADBCC]/60">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-xs sm:text-sm text-[#2B1E16] uppercase tracking-wider">
            Price Range
          </h3>
          <span className="text-xs font-bold text-[#704214]">
            Up to ${priceRange}
          </span>
        </div>
        <div className="space-y-2.5">
          <input
            type="range"
            min={minProductPrice}
            max={maxProductPrice}
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#EADBCC] rounded-lg appearance-none cursor-pointer accent-[#704214]"
          />
          <div className="flex items-center justify-between text-[11px] text-[#7A6E65] font-semibold">
            <span>${minProductPrice}</span>
            <span>${maxProductPrice}</span>
          </div>
          <button
            onClick={() => {
              setAppliedPriceMax(priceRange);
              setCurrentPage(1);
            }}
            className="w-full py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            Apply Price Filter
          </button>
        </div>
      </div>

      {/* 3. Dynamic Brands / Collections List */}
      {dynamicBrands.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-[#EADBCC]/60">
          <h3 className="font-serif font-bold text-xs sm:text-sm text-[#2B1E16] uppercase tracking-wider">
            Brand / Maker
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {dynamicBrands.map((b) => {
              const isChecked = selectedBrands.includes(b.name);
              return (
                <label 
                  key={b.name}
                  onClick={() => toggleBrand(b.name)}
                  className={`flex items-center justify-between cursor-pointer px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    isChecked ? 'bg-[#FAF5EE] text-[#704214] font-bold' : 'text-[#504136] hover:bg-[#FAF5EE]/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                      isChecked ? 'bg-[#704214] border-[#704214] text-white' : 'border-[#C4B5A5]'
                    }`}>
                      {isChecked ? '✓' : ''}
                    </div>
                    <span className="truncate max-w-[140px]">{b.name}</span>
                  </div>
                  <span className="text-[11px] text-[#7A6E65]">({b.count})</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Customer Rating Filter */}
      <div className="space-y-3 pt-3 border-t border-[#EADBCC]/60">
        <h3 className="font-serif font-bold text-xs sm:text-sm text-[#2B1E16] uppercase tracking-wider">
          Rating
        </h3>
        <div className="space-y-1">
          {[
            { stars: 5, label: '5.0 Stars' },
            { stars: 4, label: '4.0 & above' },
            { stars: 3, label: '3.0 & above' }
          ].map((item) => {
            const isSelected = minRating === item.stars;
            const count = dynamicRatingCounts[item.stars] || 0;
            return (
              <button
                key={item.stars}
                onClick={() => {
                  setMinRating(isSelected ? 0 : item.stars);
                  setCurrentPage(1);
                }}
                className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors ${
                  isSelected ? 'bg-[#FAF5EE] text-[#704214] font-bold' : 'hover:bg-[#FAF5EE]/60 text-[#504136]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] ${
                    isSelected ? 'border-[#704214] bg-[#704214] text-white' : 'border-[#C4B5A5]'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </div>
                  <div className="flex items-center text-[#C59B27]">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] ml-1">{item.label}</span>
                </div>
                <span className="text-[11px] text-[#7A6E65]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. In-Stock Availability */}
      <div className="pt-3 border-t border-[#EADBCC]/60">
        <label 
          onClick={() => { setInStockOnly(!inStockOnly); setCurrentPage(1); }}
          className="flex items-center justify-between cursor-pointer py-1.5 text-xs text-[#2B1E16] hover:text-[#704214]"
        >
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
              inStockOnly ? 'bg-[#704214] border-[#704214] text-white' : 'border-[#C4B5A5]'
            }`}>
              {inStockOnly ? '✓' : ''}
            </div>
            <span className="font-medium">In Stock Only</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            Ready to Ship
          </span>
        </label>
      </div>
    </aside>
  );

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen text-[#2B1E16] selection:bg-[#704214] selection:text-white">
      
      {/* 1. ENLARGED CATEGORY CONTAINER (Banner Hidden per Task 2) */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-6 sm:pt-8 pb-4">
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#EADBCC] p-5 sm:p-7 shadow-xs">
          
          {/* Header Row for Category Carousel */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-[#EADBCC]/60">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[#C59B27] font-bold text-sm">✦</span>
                <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#2B1E16]">
                  Shop by Category
                </h1>
              </div>
              <p className="text-xs text-[#7A6E65]">
                Explore our signature luxury departments ({dynamicCategories.length} categories available)
              </p>
            </div>

            {/* Scroll Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={() => {
                  const el = document.getElementById('shop-cats-slider');
                  if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                }}
                className="w-9 h-9 rounded-full bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center text-[#704214] hover:bg-[#704214] hover:text-white transition-all shadow-xs"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('shop-cats-slider');
                  if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                }}
                className="w-9 h-9 rounded-full bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center text-[#704214] hover:bg-[#704214] hover:text-white transition-all shadow-xs"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Enlarged Horizontal Track with Larger Pedestals */}
          <div 
            id="shop-cats-slider"
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2"
          >
            {/* "All" Category Pedestal */}
            <div
              onClick={() => {
                onSelectCategory && onSelectCategory(null);
                setCurrentPage(1);
              }}
              className="group cursor-pointer flex flex-col items-center shrink-0 w-28 sm:w-32 md:w-36 text-center transition-all hover:-translate-y-1"
            >
              <div 
                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 p-2.5 flex items-center justify-center mb-2 transition-all shadow-sm ${
                  !selectedCategory 
                    ? 'border-[#704214] bg-[#FAF5EE] ring-4 ring-[#704214]/15 scale-105' 
                    : 'border-[#EADBCC] bg-white group-hover:border-[#704214]/40 group-hover:bg-[#FAF5EE]'
                }`}
              >
                <div className="w-full h-full rounded-full bg-[#704214] flex flex-col items-center justify-center text-white">
                  <span className="font-serif font-bold text-base sm:text-lg">ALL</span>
                  <span className="text-[10px] text-[#F5EBE1]">Curations</span>
                </div>
              </div>
              <span className={`text-xs sm:text-sm font-bold leading-tight ${
                !selectedCategory ? 'text-[#704214]' : 'text-[#2B1E16] group-hover:text-[#704214]'
              }`}>
                All Products
              </span>
              <span className="text-[11px] text-[#7A6E65] mt-0.5">
                {products.length} items
              </span>
            </div>

            {/* Dynamic Category Pedestals */}
            {dynamicCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug || String(selectedCategory) === String(cat._id);
              const catImage = cat.image || `/images/categories/${cat.slug}.webp`;

              return (
                <div
                  key={cat._id || cat.slug}
                  onClick={() => {
                    onSelectCategory && onSelectCategory(isSelected ? null : cat.slug);
                    setCurrentPage(1);
                  }}
                  className="group cursor-pointer flex flex-col items-center shrink-0 w-28 sm:w-32 md:w-36 text-center transition-all hover:-translate-y-1"
                >
                  {/* Large Circular Pedestal */}
                  <div 
                    className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 p-2 flex items-center justify-center mb-2 transition-all shadow-sm ${
                      isSelected 
                        ? 'border-[#704214] bg-[#FAF5EE] ring-4 ring-[#704214]/15 scale-105' 
                        : 'border-[#EADBCC] bg-white group-hover:border-[#704214]/40 group-hover:bg-[#FAF5EE]'
                    }`}
                  >
                    <img
                      src={catImage}
                      alt={cat.name}
                      className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/categories/beauty-care.webp';
                      }}
                      loading="lazy"
                    />
                  </div>

                  {/* Category Name Label */}
                  <span className={`text-xs sm:text-sm font-bold leading-tight line-clamp-1 ${
                    isSelected ? 'text-[#704214]' : 'text-[#2B1E16] group-hover:text-[#704214]'
                  }`}>
                    {cat.name}
                  </span>

                  {/* Category Count */}
                  <span className="text-[11px] text-[#7A6E65] mt-0.5 font-medium">
                    {cat.count} items
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 2. MAIN SHOPPING CONTENT (Filters Sidebar + Products Grid) */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Left Sidebar Filters */}
          <div className="hidden lg:block bg-white p-6 rounded-3xl border border-[#EADBCC] shadow-xs sticky top-20">
            <FilterSidebar />
          </div>

          {/* Main Product Display Column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar: Result Count, Active Filter Chips, Sort Dropdown */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EADBCC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#2B1E16]">
                  Showing <span className="text-[#704214]">{filteredProducts.length}</span> luxury products
                </span>
                {selectedCategory && (
                  <span className="text-xs text-[#7A6E65] block sm:inline sm:ml-2">
                    in <span className="font-semibold text-[#704214]">"{selectedCategory}"</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Trigger Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-[#EADBCC] bg-[#FAF5EE] text-xs font-bold text-[#704214]"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#7A6E65] hidden sm:inline font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-[#FAF5EE] border border-[#EADBCC] rounded-xl font-semibold text-[#2B1E16] focus:outline-none focus:border-[#704214] cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips (if any applied) */}
            {(selectedCategory || selectedBrands.length > 0 || appliedPriceMax < maxProductPrice || minRating > 0 || inStockOnly) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#7A6E65] font-semibold">Active Filters:</span>
                
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#EADBCC] text-xs font-bold text-[#704214]">
                    Category: {selectedCategory}
                    <button onClick={() => onSelectCategory && onSelectCategory(null)} className="hover:text-red-600">×</button>
                  </span>
                )}

                {selectedBrands.map(b => (
                  <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#EADBCC] text-xs font-bold text-[#704214]">
                    Brand: {b}
                    <button onClick={() => toggleBrand(b)} className="hover:text-red-600">×</button>
                  </span>
                ))}

                {appliedPriceMax < maxProductPrice && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#EADBCC] text-xs font-bold text-[#704214]">
                    Max ${appliedPriceMax}
                    <button onClick={() => { setAppliedPriceMax(maxProductPrice); setPriceRange(maxProductPrice); }} className="hover:text-red-600">×</button>
                  </span>
                )}

                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#EADBCC] text-xs font-bold text-[#704214]">
                    {minRating}★ & above
                    <button onClick={() => setMinRating(0)} className="hover:text-red-600">×</button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EE] border border-[#EADBCC] text-xs font-bold text-[#704214]">
                    In Stock
                    <button onClick={() => setInStockOnly(false)} className="hover:text-red-600">×</button>
                  </span>
                )}

                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-red-600 hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Products Grid */}
            {currentProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#EADBCC] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center mx-auto">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#2B1E16]">
                  No Matching Products Found
                </h3>
                <p className="text-xs text-[#7A6E65] max-w-md mx-auto">
                  We couldn't find any products matching your active filters. Try adjusting your price range, clearing brand selections, or viewing all categories.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#704214] text-white rounded-full text-xs font-bold hover:bg-[#59330E] transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
            )}

            {/* Numbered Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-9 h-9 rounded-full border border-[#EADBCC] bg-white flex items-center justify-center text-xs font-bold disabled:opacity-40 hover:bg-[#FAF5EE]"
                >
                  ←
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-[#704214] text-white shadow-xs' 
                        : 'bg-white border border-[#EADBCC] text-[#2B1E16] hover:bg-[#FAF5EE]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-9 h-9 rounded-full border border-[#EADBCC] bg-white flex items-center justify-center text-xs font-bold disabled:opacity-40 hover:bg-[#FAF5EE]"
                >
                  →
                </button>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Mobile Filters Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-4/5 max-w-xs bg-white h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#EADBCC] mb-4">
                <h3 className="font-serif font-bold text-base text-[#2B1E16]">Filters</h3>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full text-[#7A6E65] hover:bg-[#FAF5EE]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar />
            </div>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="mt-6 w-full py-3 bg-[#704214] text-white rounded-full text-xs font-bold hover:bg-[#59330E]"
            >
              Show {filteredProducts.length} Results
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
