import React, { useState, useMemo } from 'react';
import { 
  Filter, X, Star, Grid3X3, LayoutList, ChevronLeft, ChevronRight, 
  SlidersHorizontal, Check, ShoppingCart, Truck, ShieldCheck, Headphones, Gift
} from 'lucide-react';
import ProductCard from '../components/home/ProductCard';

const ITEMS_PER_PAGE = 8;

const DEFAULT_SHOP_CATEGORIES = [
  { id: 'cat_fashion', name: 'Fashion & Wear', count: 120, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=80', slug: 'fashion-wear' },
  { id: 'cat_electronics', name: 'Electronics', count: 98, image: '/images/Modern Black Smartwatch with Orange Display.png', slug: 'electronics-gadgets' },
  { id: 'cat_home', name: 'Home & Living', count: 85, image: '/images/Beige Armchair and Potted Plant Set.png', slug: 'home-living' },
  { id: 'cat_beauty', name: 'Beauty & Personal Care', count: 75, image: '/images/Elegant Botanical Skincare Collection.png', slug: 'beauty-personal-care' },
  { id: 'cat_jewellery', name: 'Jewellery', count: 60, image: '/images/Polished Gold Chain with Ornate Ring Pendant.png', slug: 'jewellery-accessories' },
  { id: 'cat_footwear', name: 'Footwear', count: 90, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80', slug: 'footwear' },
  { id: 'cat_bags', name: 'Bags & Luggage', count: 52, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80', slug: 'bags-luggage' },
  { id: 'cat_sports', name: 'Sports & Fitness', count: 44, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80', slug: 'sports-fitness' }
];

const DEFAULT_SHOP_PRODUCTS = [
  {
    _id: 'shop_p1',
    title: 'Smart Watch Series 7',
    price: 59.99,
    comparePrice: 99.99,
    rating: 4.5,
    numReviews: 12.5,
    stock: 25,
    sku: 'AG-SW-701',
    category: { name: 'Electronics', slug: 'electronics-gadgets' },
    images: ['/images/Modern Black Smartwatch with Orange Display.png'],
    discount: 40
  },
  {
    _id: 'shop_p2',
    title: 'Stylish Handbag',
    price: 49.99,
    comparePrice: 76.99,
    rating: 4.6,
    numReviews: 8.8,
    stock: 18,
    sku: 'AG-HB-202',
    category: { name: 'Bags & Luggage', slug: 'bags-luggage' },
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'],
    discount: 35
  },
  {
    _id: 'shop_p3',
    title: 'Luxury Perfume',
    price: 29.99,
    comparePrice: 59.99,
    rating: 4.7,
    numReviews: 10.2,
    stock: 32,
    sku: 'AG-PF-303',
    category: { name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80'],
    discount: 50
  },
  {
    _id: 'shop_p4',
    title: 'Running Shoes',
    price: 69.99,
    comparePrice: 99.99,
    rating: 4.5,
    numReviews: 9.7,
    stock: 14,
    sku: 'AG-RS-404',
    category: { name: 'Footwear', slug: 'footwear' },
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'],
    discount: 30
  },
  {
    _id: 'shop_p5',
    title: 'Modern Armchair',
    price: 149.99,
    comparePrice: 199.99,
    rating: 4.5,
    numReviews: 7.1,
    stock: 9,
    sku: 'AG-AC-505',
    category: { name: 'Home & Living', slug: 'home-living' },
    images: ['/images/Beige Armchair and Potted Plant Set.png'],
    discount: 25
  },
  {
    _id: 'shop_p6',
    title: 'Gold Necklace',
    price: 79.99,
    comparePrice: 149.99,
    rating: 4.8,
    numReviews: 11.3,
    stock: 12,
    sku: 'AG-GN-606',
    category: { name: 'Jewellery', slug: 'jewellery-accessories' },
    images: ['/images/Polished Gold Chain with Ornate Ring Pendant.png'],
    discount: 45
  },
  {
    _id: 'shop_p7',
    title: 'Wireless Earbuds',
    price: 49.99,
    comparePrice: 83.99,
    rating: 4.5,
    numReviews: 13.2,
    stock: 40,
    sku: 'AG-WE-707',
    category: { name: 'Electronics', slug: 'electronics-gadgets' },
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'],
    discount: 40
  },
  {
    _id: 'shop_p8',
    title: 'Travel Backpack',
    price: 39.99,
    comparePrice: 49.99,
    rating: 4.6,
    numReviews: 6.8,
    stock: 22,
    sku: 'AG-TB-808',
    category: { name: 'Bags & Luggage', slug: 'bags-luggage' },
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'],
    discount: 20
  }
];

const BRAND_FILTERS = [
  { name: 'Nike', count: 45 },
  { name: 'Adidas', count: 42 },
  { name: 'Puma', count: 38 },
  { name: "Levi's", count: 35 },
  { name: 'Zara', count: 34 }
];

const COLOR_SWATCHES = [
  { name: 'Black', hex: '#1C1C1E' },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Nude', hex: '#E5C4A3' },
  { name: 'Red', hex: '#B71C1C' },
  { name: 'Purple', hex: '#8E24AA' },
  { name: 'Blue', hex: '#1976D2' },
  { name: 'Yellow', hex: '#FBC02D' },
  { name: 'Green', hex: '#388E3C' }
];

export default function ShopPage({
  products = [],
  categories = [],
  selectedCategory,
  onSelectCategory,
  onSelectProduct
}) {
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [priceMax, setPriceMax] = useState(999);
  const [appliedPriceMax, setAppliedPriceMax] = useState(999);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Combine fetched categories with default fallback to guarantee the exact 8 categories from reference
  const displayCategories = useMemo(() => {
    if (categories && categories.length >= 6) {
      return categories.map((c, idx) => ({
        ...c,
        count: c.productCount || DEFAULT_SHOP_CATEGORIES[idx % DEFAULT_SHOP_CATEGORIES.length].count
      }));
    }
    return DEFAULT_SHOP_CATEGORIES;
  }, [categories]);

  // Combine fetched products with exact 8 fallback reference items
  const baseProducts = useMemo(() => {
    if (products && products.length >= 8) {
      return products;
    }
    return DEFAULT_SHOP_PRODUCTS;
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let list = [...baseProducts];

    // Filter by Category
    if (selectedCategory) {
      list = list.filter(p => 
        p.category?.slug === selectedCategory || 
        String(p.category?._id) === String(selectedCategory) ||
        p.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by Price
    list = list.filter(p => Number(p.price) <= appliedPriceMax);

    // Filter by Rating
    if (minRating > 0) {
      list = list.filter(p => Number(p.rating || 4.5) >= minRating);
    }

    // Sort
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
  }, [baseProducts, selectedCategory, appliedPriceMax, minRating, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const clearAllFilters = () => {
    onSelectCategory && onSelectCategory(null);
    setSelectedBrands([]);
    setSelectedColor('');
    setPriceMax(999);
    setAppliedPriceMax(999);
    setMinRating(0);
    setSortBy('popular');
    setCurrentPage(1);
  };

  const toggleBrand = (brandName) => {
    setSelectedBrands(prev => 
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
  };

  // Sidebar Filter Component
  const FilterSidebar = () => (
    <aside className="space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#704214]" />
          <h2 className="font-serif text-lg font-bold text-[#2B1E16]">Filters</h2>
        </div>
        <button
          onClick={clearAllFilters}
          className="text-xs font-semibold text-[#704214] hover:underline transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* 1. Categories Checkbox List */}
      <div className="space-y-3 pt-1 border-t border-[#EADBCC]/60">
        <h3 className="font-semibold text-xs text-[#2B1E16] uppercase tracking-wider">Categories</h3>
        <div className="space-y-2 text-xs">
          {displayCategories.slice(0, 6).map((cat) => {
            const isChecked = selectedCategory === cat.slug || String(selectedCategory) === String(cat._id);
            return (
              <label 
                key={cat.id || cat._id}
                className="flex items-center justify-between cursor-pointer py-0.5 hover:text-[#704214] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      onSelectCategory(isChecked ? null : cat.slug);
                      setCurrentPage(1);
                    }}
                    className="w-3.5 h-3.5 rounded border-[#C4B5A5] text-[#704214] focus:ring-[#704214] accent-[#704214]"
                  />
                  <span className={isChecked ? 'font-bold text-[#704214]' : 'text-[#504136]'}>
                    {cat.name}
                  </span>
                </div>
                <span className="text-[11px] text-[#8C7D73]">({cat.count || 60})</span>
              </label>
            );
          })}
          <button 
            onClick={() => onSelectCategory(null)}
            className="text-[11px] font-semibold text-[#704214] hover:underline flex items-center gap-1 pt-1"
          >
            Show More ∨
          </button>
        </div>
      </div>

      {/* 2. Price Range Slider */}
      <div className="space-y-3 pt-3 border-t border-[#EADBCC]/60">
        <h3 className="font-semibold text-xs text-[#2B1E16] uppercase tracking-wider">Price Range</h3>
        <div className="space-y-2.5">
          <input
            type="range"
            min="0"
            max="999"
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full h-1.5 bg-[#EADBCC] rounded-lg appearance-none cursor-pointer accent-[#704214]"
          />
          <div className="flex items-center justify-between text-xs font-semibold text-[#504136]">
            <span>$0</span>
            <span>${priceMax}</span>
          </div>
          <button
            onClick={() => {
              setAppliedPriceMax(priceMax);
              setCurrentPage(1);
            }}
            className="w-full py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            Apply
          </button>
        </div>
      </div>

      {/* 3. Brand Filter */}
      <div className="space-y-3 pt-3 border-t border-[#EADBCC]/60">
        <h3 className="font-semibold text-xs text-[#2B1E16] uppercase tracking-wider">Brand</h3>
        <div className="space-y-2 text-xs">
          {BRAND_FILTERS.map((brand) => {
            const isChecked = selectedBrands.includes(brand.name);
            return (
              <label 
                key={brand.name}
                className="flex items-center justify-between cursor-pointer py-0.5 hover:text-[#704214] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleBrand(brand.name)}
                    className="w-3.5 h-3.5 rounded border-[#C4B5A5] text-[#704214] focus:ring-[#704214] accent-[#704214]"
                  />
                  <span className={isChecked ? 'font-bold text-[#704214]' : 'text-[#504136]'}>
                    {brand.name}
                  </span>
                </div>
                <span className="text-[11px] text-[#8C7D73]">({brand.count})</span>
              </label>
            );
          })}
          <button className="text-[11px] font-semibold text-[#704214] hover:underline flex items-center gap-1 pt-1">
            Show More ∨
          </button>
        </div>
      </div>

      {/* 4. Rating Filter */}
      <div className="space-y-3 pt-3 border-t border-[#EADBCC]/60">
        <h3 className="font-semibold text-xs text-[#2B1E16] uppercase tracking-wider">Rating</h3>
        <div className="space-y-2 text-xs">
          {[
            { stars: 5, count: '500+' },
            { stars: 4, count: '400+' },
            { stars: 3, count: '300+' },
            { stars: 2, count: '200+' },
            { stars: 1, count: '100+' }
          ].map((item) => {
            const isSelected = minRating === item.stars;
            return (
              <button
                key={item.stars}
                onClick={() => {
                  setMinRating(isSelected ? 0 : item.stars);
                  setCurrentPage(1);
                }}
                className={`w-full flex items-center justify-between py-1 px-1.5 rounded transition-colors ${
                  isSelected ? 'bg-[#FAF3EC] text-[#704214]' : 'hover:bg-[#FAF5EE] text-[#504136]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] ${
                    isSelected ? 'border-[#704214] bg-[#704214] text-white' : 'border-[#C4B5A5]'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </span>
                  <div className="flex items-center text-[#C59B27]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < item.stars ? 'fill-current' : 'text-[#D9C8B5]'}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-[#8C7D73]">({item.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Color Swatches */}
      <div className="space-y-3 pt-3 border-t border-[#EADBCC]/60">
        <h3 className="font-semibold text-xs text-[#2B1E16] uppercase tracking-wider">Color</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {COLOR_SWATCHES.map((color) => {
            const isSelected = selectedColor === color.name;
            return (
              <button
                key={color.name}
                onClick={() => setSelectedColor(isSelected ? '' : color.name)}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                  color.border ? 'border border-[#C4B5A5]' : ''
                } ${isSelected ? 'ring-2 ring-[#704214] ring-offset-2 scale-110' : ''}`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {isSelected && (
                  <span className={`text-[10px] ${color.name === 'White' || color.name === 'Yellow' ? 'text-black font-bold' : 'text-white font-bold'}`}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="w-full bg-[#FAF5EE] min-h-screen">
      
      {/* 1. HERO BANNER matching Reference Image 3 - Full Cover Background with Left Side Content Overlay */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-5 sm:pt-7 pb-3">
        <div 
          className="relative w-full rounded-2xl sm:rounded-3xl border border-[#EADBCC] overflow-hidden min-h-[260px] sm:min-h-[320px] lg:min-h-[360px] flex items-center shadow-luxury"
          style={{
            backgroundImage: "url('/images/sliderimage1.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Soft champagne gradient overlay to keep left text perfectly legible while letting the full luxury background show */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF1E4] via-[#FAF1E4]/90 to-transparent w-full md:w-3/5 pointer-events-none" />

          {/* Left Text Content sitting directly above the full cover image */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-xl">
            {/* Tagline */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-6 h-[1.5px] bg-[#C59B27]" />
              <span className="text-[11px] sm:text-xs font-bold text-[#8A631E] uppercase tracking-widest">
                PREMIUM COLLECTION
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2B1E16] tracking-tight leading-tight mb-2 sm:mb-3">
              Shop Your Style
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#7A6E65] leading-relaxed mb-5 sm:mb-6 max-w-md">
              Discover the latest trends in fashion, electronics, home &amp; living and more.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => {
                onSelectCategory && onSelectCategory(null);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#593014] hover:bg-[#43230C] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <span className="text-sm">→</span>
            </button>
          </div>

          {/* "Up to 70% OFF" Circular Badge */}
          <div className="absolute right-6 top-8 lg:right-14 lg:top-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-sm border-2 border-dashed border-[#C59B27] flex flex-col items-center justify-center text-center shadow-lg pointer-events-auto z-10">
            <span className="text-[9px] sm:text-[10px] font-bold text-[#704214] uppercase leading-none">Up to</span>
            <span className="font-serif text-base sm:text-xl font-black text-[#B93822] leading-none my-0.5">70%</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#704214] uppercase leading-none">OFF</span>
          </div>

          {/* Carousel dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-[#593014]" />
            <span className="w-2 h-2 rounded-full bg-[#D9C8B5]" />
            <span className="w-2 h-2 rounded-full bg-[#D9C8B5]" />
          </div>
        </div>
      </section>

      {/* 2. HORIZONTAL CATEGORIES ROW matching Reference Image 3 */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
        <div className="relative flex items-center">
          {/* Left Arrow */}
          <button 
            onClick={() => {
              const el = document.getElementById('shop-cats-slider');
              if (el) el.scrollBy({ left: -240, behavior: 'smooth' });
            }}
            className="w-8 h-8 rounded-full bg-white border border-[#EADBCC] flex items-center justify-center text-[#704214] shadow-sm hover:bg-[#FAF3EC] transition-colors shrink-0 z-10 mr-2 hidden sm:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Categories track */}
          <div 
            id="shop-cats-slider"
            className="flex-1 flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2"
          >
            {displayCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug || String(selectedCategory) === String(cat._id);
              return (
                <div
                  key={cat.id || cat._id}
                  onClick={() => {
                    onSelectCategory && onSelectCategory(isSelected ? null : cat.slug);
                    setCurrentPage(1);
                  }}
                  className="group cursor-pointer flex flex-col items-center shrink-0 w-24 sm:w-28 text-center transition-transform hover:-translate-y-1"
                >
                  {/* Circular Pedestal */}
                  <div 
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border p-2 flex items-center justify-center mb-1.5 transition-all shadow-sm ${
                      isSelected 
                        ? 'border-[#704214] bg-[#FAF3EC] ring-2 ring-[#704214]/20' 
                        : 'border-[#EADBCC] bg-[#FFFDF9] group-hover:border-[#704214]/40 group-hover:bg-[#FAF3EC]'
                    }`}
                  >
                    <img
                      src={cat.image || '/images/categories/beauty-care.webp'}
                      alt={cat.name}
                      className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  {/* Category Name */}
                  <span className={`text-[11px] sm:text-xs font-semibold leading-tight line-clamp-1 ${
                    isSelected ? 'text-[#704214] font-bold' : 'text-[#2B1E16] group-hover:text-[#704214]'
                  }`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={() => {
              const el = document.getElementById('shop-cats-slider');
              if (el) el.scrollBy({ left: 240, behavior: 'smooth' });
            }}
            className="w-8 h-8 rounded-full bg-white border border-[#EADBCC] flex items-center justify-center text-[#704214] shadow-sm hover:bg-[#FAF3EC] transition-colors shrink-0 z-10 ml-2 hidden sm:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. MAIN SHOPPING CONTENT (Filters Sidebar + 8 Products Grid) */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Left Sidebar Filters */}
          <div className="hidden lg:block bg-white p-5 rounded-2xl border border-[#F0E7DB] shadow-sm sticky top-20">
            <FilterSidebar />
          </div>

          {/* Main Product Column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EADBCC]">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16]">
                  Shop
                </h2>
                <p className="text-xs text-[#7A6E65] mt-0.5">
                  Browse our wide range of premium products ({filteredProducts.length} items)
                </p>
              </div>

              {/* Controls Row */}
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-1.5 bg-white border border-[#EADBCC] rounded-lg text-xs font-semibold text-[#2B1E16] flex items-center gap-1.5 shadow-sm"
                >
                  <Filter className="w-3.5 h-3.5 text-[#704214]" />
                  <span>Filters</span>
                </button>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#7A6E65] hidden sm:inline">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 bg-white border border-[#EADBCC] rounded-lg text-xs font-semibold text-[#2B1E16] focus:outline-none focus:border-[#704214]"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">New Arrivals</option>
                  </select>
                </div>

                {/* View Mode Grid/List toggle */}
                <div className="hidden sm:flex items-center border border-[#EADBCC] rounded-lg bg-white p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-[#FAF3EC] text-[#704214]' : 'text-[#7A6E65]'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-[#FAF3EC] text-[#704214]' : 'text-[#7A6E65]'
                    }`}
                    aria-label="List view"
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 8 Product Cards Grid matching Reference Image 3 (4 cols on desktop) */}
            {currentProducts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-[#F0E7DB] shadow-sm space-y-3">
                <p className="font-serif text-lg font-bold text-[#2B1E16]">No matching luxury products found</p>
                <p className="text-xs text-[#7A6E65]">Try resetting your filter parameters or exploring other categories.</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-[#704214] text-white rounded-full text-xs font-semibold shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 sm:gap-5 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {currentProducts.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
            )}

            {/* Pagination matching Reference Image 3: < 1 2 3 ... 10 > */}
            <div className="pt-8 pb-4 flex items-center justify-center gap-2 select-none">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full border border-[#EADBCC] bg-white flex items-center justify-center text-xs font-semibold text-[#504136] hover:bg-[#FAF3EC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Previous page"
              >
                ‹
              </button>

              {/* Page 1 (Active brown circle if currentPage === 1) */}
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  currentPage === 1 
                    ? 'bg-[#593014] text-white shadow-sm' 
                    : 'bg-white border border-[#EADBCC] text-[#504136] hover:bg-[#FAF3EC]'
                }`}
              >
                1
              </button>

              {/* Page 2 */}
              <button
                onClick={() => setCurrentPage(2)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  currentPage === 2 
                    ? 'bg-[#593014] text-white shadow-sm' 
                    : 'bg-white border border-[#EADBCC] text-[#504136] hover:bg-[#FAF3EC]'
                }`}
              >
                2
              </button>

              {/* Page 3 */}
              <button
                onClick={() => setCurrentPage(3)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  currentPage === 3 
                    ? 'bg-[#593014] text-white shadow-sm' 
                    : 'bg-white border border-[#EADBCC] text-[#504136] hover:bg-[#FAF3EC]'
                }`}
              >
                3
              </button>

              {/* Ellipsis */}
              <span className="text-xs text-[#7A6E65] px-1">...</span>

              {/* Page 10 */}
              <button
                onClick={() => setCurrentPage(10)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  currentPage === 10 
                    ? 'bg-[#593014] text-white shadow-sm' 
                    : 'bg-white border border-[#EADBCC] text-[#504136] hover:bg-[#FAF3EC]'
                }`}
              >
                10
              </button>

              {/* Next */}
              <button
                onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
                disabled={currentPage >= 10}
                className="w-8 h-8 rounded-full border border-[#EADBCC] bg-white flex items-center justify-center text-xs font-semibold text-[#504136] hover:bg-[#FAF3EC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Next page"
              >
                ›
              </button>
            </div>

            {/* Trust Features Bar matching bottom of Reference Image 3 */}
            <div className="relative rounded-2xl bg-white border border-[#EADBCC] p-4 sm:p-6 overflow-hidden shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF3EC] flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-[#704214]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1E16]">Free Shipping</h4>
                    <p className="text-[10px] text-[#7A6E65]">On All Orders</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF3EC] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#704214]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1E16]">Secure Payments</h4>
                    <p className="text-[10px] text-[#7A6E65]">100% Secure</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF3EC] flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5 text-[#704214]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1E16]">24/7 Support</h4>
                    <p className="text-[10px] text-[#7A6E65]">Dedicated Support</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF3EC] flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-[#704214]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2B1E16]">Exclusive Offers</h4>
                    <p className="text-[10px] text-[#7A6E65]">Save More</p>
                  </div>
                </div>
              </div>

              {/* Right decorative golden shopping bag illustration */}
              <div className="absolute right-2 bottom-0 top-0 w-24 pointer-events-none select-none opacity-20 hidden md:block">
                <img
                  src="/images/Luxurious Golden Gift Box with Bow.png"
                  alt=""
                  className="h-full w-auto object-contain object-right"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div 
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCC]">
              <h3 className="font-serif text-base font-bold text-[#2B1E16]">Filter Products</h3>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#7A6E65]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <FilterSidebar />
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 bg-[#593014] text-white rounded-full text-xs font-bold shadow-md"
            >
              Apply &amp; View Results ({filteredProducts.length})
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
