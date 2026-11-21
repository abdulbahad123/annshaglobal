import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '../components/home/ProductCard';

export default function OurCollectionPage({ products = [], categories = [], onSelectCategory, onSelectProduct }) {
  const collections = [
    {
      title: 'The Signature Monogram Capsule',
      tagline: 'EXCLUSIVE & TIMELESS',
      description: 'Handpicked calfskin leather accessories, tailored footwear, and quintessential statements.',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      categorySlug: 'jewellery-accessories'
    },
    {
      title: 'The Modern Sanctuary Collection',
      tagline: 'ORGANIC LIVING',
      description: 'Sculptural ceramic lamps, warm linen touches, and peaceful residential decor.',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      categorySlug: 'home-living'
    },
    {
      title: 'Personal Care & Olfactory Art',
      tagline: 'SUSTAINABLE LUXURY',
      description: 'Enchanting floral and amber accords paired with restorative cold-pressed skincare.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
      categorySlug: 'beauty-personal-care'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.25em] text-[#704214] uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>CURATED CAPSULES</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1E16]">
          Our Curated Collections
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6E65]">
          Explore seasonal lookbooks and thematic luxury galleries curated by our international design directors.
        </p>
      </div>

      {/* Thematic Collection Cards */}
      <div className="space-y-8">
        {collections.map((col, idx) => (
          <div
            key={idx}
            className={`rounded-3xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-luxury overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
          >
            <div className={`lg:col-span-6 aspect-[16/10] lg:aspect-auto h-full ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <img src={col.image} alt={col.title} className="w-full h-full object-cover max-h-[380px]" />
            </div>
            <div className={`lg:col-span-6 p-6 sm:p-10 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <span className="text-[10px] font-bold tracking-widest text-[#704214] uppercase">
                {col.tagline}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16] leading-snug">
                {col.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#605248] leading-relaxed">
                {col.description}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onSelectCategory(col.categorySlug)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm"
                >
                  <span>Explore Capsule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Items from Collections */}
      <div className="space-y-4 pt-6">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1E16]">
          Featured Pieces Across Collections
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {products.slice(0, 6).map((p) => (
            <ProductCard key={p._id} product={p} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      </div>
    </div>
  );
}

