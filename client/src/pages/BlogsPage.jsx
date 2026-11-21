import React, { useState } from 'react';
import { Calendar, User, Clock, ArrowRight, X } from 'lucide-react';

export default function BlogsPage({ articles = [], config = {} }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fallbackArticles = [
    {
      id: 1,
      title: 'The Art of Curating a Mindful Luxury Home',
      category: 'Home & Living',
      date: 'November 18, 2026',
      author: 'Elena Rostova',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      summary: 'Discover how organic textures, warm ivory palettes, and sculptural ceramics create enduring peaceful spaces in modern urban sanctuaries.',
      content: 'Interior design is moving toward soulful minimalism. In this deep dive, we explore how natural light, earth-toned textiles, and bespoke furniture investments elevate your daily living experience. By choosing fewer, more meaningful artifacts, you create an environment that breathes style and tranquility.'
    },
    {
      id: 2,
      title: 'Timeless Horology: Investing in Fine Watches',
      category: 'Jewellery & Watches',
      date: 'November 14, 2026',
      author: 'Alexander Wright',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      summary: 'From precision mechanics to sapphire crystal heritage, understand why smart craftsmanship and classic horology retain lifetime value.',
      content: 'Fine watches represent the intersection of high engineering and personal legacy. Whether considering modern smart features or classical mechanical movements, our horology experts detail the hallmarks of authentic watchmaking and how to curate a timeless collection.'
    },
    {
      id: 3,
      title: 'Winter Beauty Rituals: Radiance Through Botanical Oils',
      category: 'Beauty & Care',
      date: 'November 10, 2026',
      author: 'Sophia Laurent',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
      summary: 'Combat dry winter air with restorative jasmine extracts, rosehip seed oil, and clean barrier restoration formulations.',
      content: 'Cold weather demands a shift toward lipid-rich serums and intensive hydration rituals. We break down the clinical benefits of cold-pressed botanical essences and how to achieve an effortless, healthy glow throughout the festive season.'
    }
  ];

  const displayArticles = (articles && articles.length > 0) ? articles : fallbackArticles;
  const tagline = config?.tagline || 'EDITORIAL & JOURNAL';
  const headerTitle = config?.title || 'Stories of Craft, Style & Home';
  const headerSubtitle = config?.subtitle || 'Curated perspectives on timeless design, luxury lifestyle, and bespoke craftsmanship from the Annsha Global editorial desk.';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-bold tracking-[0.25em] text-[#704214] uppercase">
          {tagline}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1E16]">
          {headerTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6E65]">
          {headerSubtitle}
        </p>
      </div>

      {/* Featured Big Article */}
      {displayArticles[0] && (
        <div className="rounded-3xl overflow-hidden bg-[#FFFDF9] border border-[#F0E7DB] shadow-luxury grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto h-full">
            <img
              src={displayArticles[0].image}
              alt={displayArticles[0].title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-5 p-6 sm:p-10 space-y-4">
            <span className="px-3 py-1 bg-[#F5EBE1] text-[#704214] text-[10px] font-bold rounded-full uppercase tracking-wider">
              {displayArticles[0].category}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16] leading-tight">
              {displayArticles[0].title}
            </h2>
            <p className="text-xs sm:text-sm text-[#605248] leading-relaxed">
              {displayArticles[0].summary}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-[#7A6E65] pt-2 border-t border-[#F0E7DB]">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{displayArticles[0].date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{displayArticles[0].readTime}</span>
            </div>
            <button
              onClick={() => setSelectedArticle(displayArticles[0])}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              <span>Read Article</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayArticles.map((art) => (
          <div
            key={art.id}
            className="rounded-3xl bg-[#FFFDF9] border border-[#F0E7DB] overflow-hidden shadow-sm hover:shadow-luxury hover:border-[#704214]/30 transition-all flex flex-col justify-between"
          >
            <div className="aspect-[16/10] overflow-hidden bg-[#FAF5EE]">
              <img src={art.image} alt={art.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#704214] tracking-wider uppercase">{art.category}</span>
                <h3 className="font-serif text-lg font-bold text-[#2B1E16] leading-snug line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-[#605248] line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>
              <div className="pt-3 border-t border-[#F0E7DB] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#7A6E65]">{art.date}</span>
                <button
                  onClick={() => setSelectedArticle(art)}
                  className="font-bold text-[#704214] hover:underline flex items-center gap-1"
                >
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-4 border border-[#F0E7DB] shadow-2xl">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#7A6E65] hover:bg-[#F5EBE1]"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 bg-[#F5EBE1] text-[#704214] text-[10px] font-bold rounded-full uppercase">
              {selectedArticle.category}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16]">
              {selectedArticle.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-[#7A6E65]">
              <span>By {selectedArticle.author}</span>
              <span>•</span>
              <span>{selectedArticle.date}</span>
              <span>•</span>
              <span>{selectedArticle.readTime}</span>
            </div>
            <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-64 object-cover rounded-2xl" />
            <div className="text-xs sm:text-sm text-[#605248] leading-relaxed space-y-3 pt-2">
              <p className="font-medium text-[#2B1E16]">{selectedArticle.summary}</p>
              <p>{selectedArticle.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

