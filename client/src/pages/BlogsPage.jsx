import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  ArrowRight, 
  Sparkles, 
  X,
  Clock,
  User,
  Share2
} from 'lucide-react';
import PreFooterNewsletter from '../components/common/PreFooterNewsletter';

export default function BlogsPage({ articles = [], config = {}, onShopNow }) {
  // State for search, category filter, tag filter, sort, view mode, pagination, and modal
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'oldest' | 'popular'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [readingArticle, setReadingArticle] = useState(null);

  // Dynamic header configuration from Admin Panel
  const bannerTitle = config?.title || 'Our Blog';
  const bannerSubtitle = config?.subtitle || 'Stay Inspired, Live Beautifully';
  const bannerImage = config?.bannerImage || config?.heroBg || '/images/ourbrand.png';

  // Seed default 9 articles matching the reference image perfectly if database is empty
  const defaultArticles = [
    {
      id: 1,
      title: "10 Fashion Trends You'll Love in 2025",
      category: "Fashion",
      summary: "Discover the top fashion trends that will define 2025 and elevate your daily wardrobe with timeless elegance.",
      content: "From structured monochromatic tailoring to ethereal silk drape silhouettes, 2025 redefines luxury through intentional craftsmanship. Modern fashion is moving toward heirloom quality, where quiet luxury meets bold architectural accents.",
      date: "April 20, 2025",
      commentsCount: 12,
      tags: ["Fashion", "Style", "Trends"],
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      title: "How to Choose the Perfect Gift",
      category: "Gift Ideas",
      summary: "Find thoughtful and stylish gift ideas for every occasion, celebrating cherished relationships with certified luxury.",
      content: "The art of gifting begins with observation. Understanding someone's daily rituals allows you to choose gifts that offer enduring utility and aesthetic delight. From personalized leather goods to artisanal home scents, explore our bespoke selection.",
      date: "April 18, 2025",
      commentsCount: 8,
      tags: ["Gift Ideas", "Shopping", "Lifestyle"],
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      title: "Simple Home Decor Ideas for Every Space",
      category: "Home Decor",
      summary: "Transform your space with these easy and elegant ideas, embracing organic textures, warm ivory, and sculptural ceramics.",
      content: "Creating a sanctuary at home doesn't require complete renovation. Strategic lighting, curated tabletop sculptures, and tactile natural textiles immediately infuse warmth and tranquility into modern living rooms.",
      date: "April 15, 2025",
      commentsCount: 10,
      tags: ["Home Decor", "Decor", "Lifestyle"],
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 4,
      title: "Skincare Routine for Healthy Glowing Skin",
      category: "Beauty & Skincare",
      summary: "Get that natural glow with these simple skincare tips, utilizing botanical oils and deeply restorative barrier hydration.",
      content: "True radiance is cultivated through consistency and clean, certified active botanicals. Discover our restorative 4-step evening ritual designed to soothe stressed skin and lock in luminous morning hydration.",
      date: "April 12, 2025",
      commentsCount: 14,
      tags: ["Beauty & Skincare", "Beauty", "Lifestyle"],
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 5,
      title: "Must-Have Accessories for Every Season",
      category: "Lifestyle",
      summary: "Upgrade your style with these must-have accessories, from artisanal sunglasses to hand-stitched leather totes.",
      content: "Accessories are the exclamation points of personal style. Explore how signature eyewear, hand-finished silk scarves, and premium leather accessories effortlessly transition your looks across changing seasons.",
      date: "April 10, 2025",
      commentsCount: 9,
      tags: ["Lifestyle", "Fashion", "Style"],
      image: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 6,
      title: "Top 5 Fashion Trends for Spring 2025",
      category: "Trends",
      summary: "Step into spring with the latest fashion trends, featuring breezy silhouettes, pastel linen, and lightweight layering.",
      content: "As temperatures rise, fashion leans into effortless breathability. From artisanal embroidery to refined safari silhouettes, discover the 5 defining catwalk movements making waves this spring.",
      date: "April 08, 2025",
      commentsCount: 11,
      tags: ["Trends", "Fashion", "Style"],
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
    }
  ];

  const allArticles = (articles && articles.length > 0) ? articles : defaultArticles;

  // Static Categories from Reference Image 1 with counts
  const categoriesList = [
    { name: 'Fashion', count: 12 },
    { name: 'Lifestyle', count: 10 },
    { name: 'Beauty & Skincare', count: 8 },
    { name: 'Home Decor', count: 7 },
    { name: 'Gift Ideas', count: 5 },
    { name: 'Shopping Tips', count: 5 },
    { name: 'Trends', count: 3 }
  ];

  // Tags list from Reference Image 1
  const tagsList = ['Fashion', 'Beauty', 'Style', 'Lifestyle', 'Decor', 'Trends', 'Shopping', 'Gift Ideas'];

  // Recent posts for sidebar
  const recentPosts = allArticles.slice(0, 3);

  // Filter & Sort Articles
  const filteredArticles = useMemo(() => {
    let result = [...allArticles];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.title?.toLowerCase().includes(q) || 
        a.summary?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(a => 
        a.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedTag) {
      result = result.filter(a => 
        (a.tags || []).some(t => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.date || '2025-04-20') - new Date(a.date || '2025-04-20'));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.date || '2025-04-20') - new Date(b.date || '2025-04-20'));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    }

    return result;
  }, [allArticles, searchTerm, selectedCategory, selectedTag, sortBy]);

  // Pagination logic (6 per page)
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const paginatedArticles = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen text-[#2B1E16] selection:bg-[#704214] selection:text-white">
      
      {/* 1. TOP HERO BANNER (Pixel-by-Pixel to Reference Image 1) */}
      <section 
        className="w-full relative py-12 sm:py-16 lg:py-20 px-4 sm:px-8 border-b border-[#EADBCC] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(250, 245, 238, 0.92) 0%, rgba(250, 245, 238, 0.75) 50%, rgba(250, 245, 238, 0.4) 100%), url("${bannerImage}")`,
          backgroundColor: '#FAF5EE'
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2B1E16] tracking-tight">
              {bannerTitle}
            </h1>
            <p className="text-sm sm:text-base font-serif italic text-[#704214] tracking-wide">
              {bannerSubtitle}
            </p>
            {/* Ornamental Divider matching Image 1 */}
            <div className="flex items-center gap-2 justify-center md:justify-start pt-1">
              <span className="w-12 h-[1px] bg-[#C59B27]"></span>
              <span className="w-2 h-2 rotate-45 bg-[#C59B27]"></span>
              <span className="w-12 h-[1px] bg-[#C59B27]"></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN BLOG BODY (Dual Column Layout: Left Sidebar + Right Article Grid) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR (Search, Categories, Recent Posts, Tags, Promo) */}
          {/* ========================================================= */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
            
            {/* Card 1: Search Blog */}
            <div className="bg-white p-5 rounded-2xl border border-[#EADBCC] shadow-xs">
              <h3 className="font-serif text-sm font-bold text-[#2B1E16] mb-3">
                Search Blog
              </h3>
              <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Search articles..."
                  className="w-full pl-3.5 pr-11 py-2 bg-[#FAF7F2] border border-[#EADBCC] rounded-xl text-xs text-[#2B1E16] placeholder-[#A4978C] focus:bg-white focus:border-[#704214] focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 w-8 h-8 rounded-lg bg-[#704214] hover:bg-[#59330E] text-white flex items-center justify-center transition-colors shadow-2xs"
                  aria-label="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Card 2: Categories */}
            <div className="bg-white p-5 rounded-2xl border border-[#EADBCC] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-sm font-bold text-[#2B1E16]">
                  Categories
                </h3>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-[10px] text-[#704214] font-semibold hover:underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <ul className="space-y-1 text-xs">
                {categoriesList.map((cat, idx) => {
                  const isCatActive = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(isCatActive ? null : cat.name);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg transition-colors text-left ${
                          isCatActive 
                            ? 'bg-[#FAF5EE] text-[#704214] font-bold border-l-2 border-[#704214]' 
                            : 'text-[#605248] hover:text-[#704214] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span>{cat.name} ({cat.count})</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#A4978C]" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Card 3: Recent Posts */}
            <div className="bg-white p-5 rounded-2xl border border-[#EADBCC] shadow-xs">
              <h3 className="font-serif text-sm font-bold text-[#2B1E16] mb-3">
                Recent Posts
              </h3>
              <div className="space-y-3.5">
                {recentPosts.map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => setReadingArticle(post)}
                    className="flex items-center gap-3 group cursor-pointer"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#EADBCC] group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#2B1E16] group-hover:text-[#704214] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h4>
                      <span className="text-[10px] text-[#A4978C] block mt-0.5">
                        {post.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Tags */}
            <div className="bg-white p-5 rounded-2xl border border-[#EADBCC] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-sm font-bold text-[#2B1E16]">
                  Tags
                </h3>
                {selectedTag && (
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className="text-[10px] text-[#704214] font-semibold hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tagsList.map((tag, idx) => {
                  const isTagActive = selectedTag?.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedTag(isTagActive ? null : tag);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 text-[11px] rounded-full border transition-all ${
                        isTagActive 
                          ? 'bg-[#704214] text-white border-[#704214] font-semibold shadow-xs' 
                          : 'bg-[#FAF7F2] text-[#605248] border-[#EADBCC] hover:border-[#704214] hover:text-[#704214]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 5: Promo Card matching Image 1 */}
            <div className="bg-gradient-to-br from-[#FAF5EE] to-[#F3E7D7] p-5 rounded-2xl border border-[#EADBCC] text-center space-y-3 relative overflow-hidden shadow-xs">
              <h4 className="font-serif text-base font-bold text-[#2B1E16]">
                Get 20% OFF
              </h4>
              <p className="text-xs text-[#7A6E65]">
                on your first order
              </p>
              <button
                type="button"
                onClick={() => onShopNow ? onShopNow() : (window.location.href = '/shop')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="w-16 h-16 mx-auto pt-1 opacity-90">
                <img
                  src="/images/Luxurious Golden Gift Box with Bow.png"
                  alt="Gift Promo"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>

          </aside>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (Filter Bar + 3-Column Blog Cards + Pagination) */}
          {/* ========================================================= */}
          <section className="flex-1 space-y-6 w-full">
            
            {/* Top Toolbar matching Image 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#EADBCC] shadow-xs">
              <span className="text-xs text-[#7A6E65] font-medium">
                Showing 1–{paginatedArticles.length} of {filteredArticles.length} posts
              </span>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-1.5 text-xs text-[#605248]">
                  <span className="text-[11px] font-semibold text-[#A4978C]">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#FAF7F2] border border-[#EADBCC] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#2B1E16] focus:outline-none cursor-pointer"
                  >
                    <option value="latest">Latest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

                {/* View switcher icons */}
                <div className="flex items-center gap-1 border-l border-[#EADBCC] pl-2.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#704214] text-white' : 'text-[#A4978C] hover:bg-[#FAF7F2]'}`}
                    aria-label="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#704214] text-white' : 'text-[#A4978C] hover:bg-[#FAF7F2]'}`}
                    aria-label="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Articles Display Grid / List (Pixel-by-Pixel to Image 1) */}
            {paginatedArticles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#EADBCC] p-12 text-center space-y-3">
                <p className="font-serif text-base text-[#2B1E16] font-bold">No articles found</p>
                <p className="text-xs text-[#7A6E65]">Try clearing your search query or selecting another category.</p>
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setSelectedCategory(null); setSelectedTag(null); }}
                  className="px-4 py-2 bg-[#704214] text-white rounded-full text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedArticles.map((art) => (
                  <article
                    key={art.id}
                    className="bg-white rounded-2xl border border-[#EADBCC] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Container with Category Pill Badge */}
                      <div className="relative aspect-[16/11] overflow-hidden bg-[#FAF7F2]">
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-xs text-[#704214] text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                          {art.category}
                        </span>
                      </div>

                      {/* Content Area */}
                      <div className="p-4 sm:p-5 space-y-2.5">
                        <h2 className="font-serif text-sm sm:text-base font-bold text-[#2B1E16] group-hover:text-[#704214] transition-colors leading-snug line-clamp-2">
                          {art.title}
                        </h2>
                        <p className="text-xs text-[#7A6E65] line-clamp-3 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Read More Button */}
                    <div className="p-4 sm:p-5 pt-0 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-[#A4978C] border-t border-[#F0E7DB] pt-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#704214]" />
                          <span>{art.date}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-[#704214]" />
                          <span>{art.commentsCount || 10}</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setReadingArticle(art)}
                        className="w-full py-2.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <span>Read More</span>
                        <span>→</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* List View Mode */
              <div className="space-y-4">
                {paginatedArticles.map((art) => (
                  <article
                    key={art.id}
                    className="bg-white rounded-2xl border border-[#EADBCC] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-center group"
                  >
                    <div className="relative w-full sm:w-48 aspect-[16/11] shrink-0 rounded-xl overflow-hidden bg-[#FAF7F2]">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-white/95 text-[#704214] text-[9px] font-bold rounded-full uppercase tracking-wider">
                        {art.category}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-4 text-[11px] text-[#A4978C]">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#704214]" />{art.date}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-[#704214]" />{art.commentsCount || 10} Comments</span>
                      </div>
                      <h2 className="font-serif text-base sm:text-lg font-bold text-[#2B1E16] group-hover:text-[#704214] transition-colors leading-snug">
                        {art.title}
                      </h2>
                      <p className="text-xs text-[#7A6E65] line-clamp-2 leading-relaxed">
                        {art.summary}
                      </p>
                      <button
                        type="button"
                        onClick={() => setReadingArticle(art)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-bold tracking-wide transition-all shadow-xs mt-1"
                      >
                        <span>Read More</span>
                        <span>→</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination Controls matching Image 1 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                {[...Array(totalPages)].map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => { setCurrentPage(pNum); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                      className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                        currentPage === pNum 
                          ? 'bg-[#704214] text-white shadow-xs' 
                          : 'bg-white text-[#605248] border border-[#EADBCC] hover:bg-[#FAF5EE]'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                {currentPage < totalPages && (
                  <button
                    type="button"
                    onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                    className="w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center bg-white text-[#605248] border border-[#EADBCC] hover:bg-[#FAF5EE] transition-all"
                  >
                    →
                  </button>
                )}
              </div>
            )}

          </section>

        </div>
      </main>

      {/* 3. FULL ARTICLE READING MODAL */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#EADBCC] shadow-2xl relative p-6 sm:p-8 space-y-5">
            <button
              onClick={() => setReadingArticle(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#A4978C] hover:bg-[#FAF7F2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-3 py-1 bg-[#FAF5EE] text-[#704214] text-[10px] font-bold rounded-full uppercase tracking-wider">
              {readingArticle.category}
            </span>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1E16] leading-snug">
              {readingArticle.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-[#A4978C] border-b border-[#F0E7DB] pb-3">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{readingArticle.date}</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />{readingArticle.commentsCount || 10} Comments</span>
            </div>

            <div className="aspect-[16/9] rounded-2xl overflow-hidden">
              <img
                src={readingArticle.image}
                alt={readingArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs sm:text-sm text-[#605248] leading-relaxed font-serif text-justify">
              {readingArticle.content || readingArticle.summary}
            </p>

            <div className="pt-4 border-t border-[#F0E7DB] flex items-center justify-between">
              <span className="text-xs text-[#A4978C]">Published by Annsha Editorial Desk</span>
              <button
                onClick={() => setReadingArticle(null)}
                className="px-5 py-2 bg-[#704214] text-white rounded-full text-xs font-bold"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRE-FOOTER NEWSLETTER BAR (Pixel-by-Pixel matching Reference Image 1) */}
      <PreFooterNewsletter />

    </div>
  );
}
