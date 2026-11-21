import React from 'react';
import { Award, Compass, Heart, ShieldCheck } from 'lucide-react';

export default function OurBrandPage({ config }) {
  const brand = config || {};
  const tagline = brand.tagline || 'THE ANNSHA GLOBAL HERITAGE';
  const title = brand.title || 'Care, Style and Home, All in One Place.';
  const subtitle = brand.subtitle || 'Founded with a commitment to elevate everyday living, Annsha Global connects connoisseurs of fine design with certified luxury goods, artisanal decor, and timeless essentials across the world.';
  const philosophyTagline = brand.philosophyTagline || 'OUR PHILOSOPHY';
  const philosophyTitle = brand.philosophyTitle || 'Your World, Your Choice.';
  const philosophyText = brand.philosophyText || 'We believe that true luxury lies in the harmony between beauty and utility. Our team scours global design capitals to bring you certified footwear, bespoke jewelry, modern smart technology, and serene home appointments that withstand the test of time.';
  const stat1Value = brand.stat1Value || '100%';
  const stat1Label = brand.stat1Label || 'Authenticity Verified';
  const stat2Value = brand.stat2Value || '45+';
  const stat2Label = brand.stat2Label || 'Countries Shipped';
  const stat3Value = brand.stat3Value || '24/7';
  const stat3Label = brand.stat3Label || 'Concierge Service';
  const imageUrl = brand.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-14 space-y-14">
      {/* Brand Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        {/* Monogram Monolith */}
        <div className="w-16 h-16 mx-auto flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#704214]">
            <text x="36" y="62" fontFamily="Playfair Display, serif" fontSize="42" fontWeight="700" fill="#704214">A</text>
            <text x="50" y="68" fontFamily="Playfair Display, serif" fontSize="36" fontWeight="600" fill="#C59B27">G</text>
          </svg>
        </div>
        <span className="text-[11px] font-bold tracking-[0.3em] text-[#704214] uppercase block">
          {tagline}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2B1E16] leading-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#605248] leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Visual Manifesto Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center rounded-3xl bg-[#FFFDF9] border border-[#F0E7DB] p-6 sm:p-12 shadow-luxury">
        <div className="space-y-4">
          <span className="text-[10px] font-bold tracking-wider text-[#704214] uppercase">
            {philosophyTagline}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16] leading-snug">
            {philosophyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#605248] leading-relaxed">
            {philosophyText}
          </p>
          <div className="pt-2 flex items-center gap-6 text-xs text-[#2B1E16] font-semibold">
            <div>
              <span className="text-2xl font-serif font-bold text-[#704214] block">{stat1Value}</span>
              <span className="text-[10px] text-[#7A6E65]">{stat1Label}</span>
            </div>
            <div className="w-[1px] h-8 bg-[#EADBCC]"></div>
            <div>
              <span className="text-2xl font-serif font-bold text-[#704214] block">{stat2Value}</span>
              <span className="text-[10px] text-[#7A6E65]">{stat2Label}</span>
            </div>
            <div className="w-[1px] h-8 bg-[#EADBCC]"></div>
            <div>
              <span className="text-2xl font-serif font-bold text-[#704214] block">{stat3Value}</span>
              <span className="text-[10px] text-[#7A6E65]">{stat3Label}</span>
            </div>
          </div>
        </div>

        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
          <img
            src={imageUrl}
            alt="Annsha Global Staging"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Core Values 4-Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="font-serif text-2xl font-bold text-[#2B1E16]">
            Our Guiding Pillars
          </h3>
          <p className="text-xs text-[#7A6E65] mt-1">
            Principles that govern every product we curate and every customer we serve.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-sm space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#2B1E16]">Artisanal Precision</h4>
            <p className="text-xs text-[#7A6E65] leading-relaxed">
              Every seam, material grain, and mechanical tolerance is thoroughly evaluated before arriving in our catalog.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-sm space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#2B1E16]">Certified Genuine</h4>
            <p className="text-xs text-[#7A6E65] leading-relaxed">
              Zero tolerance for replicas. We maintain direct relationships with brand makers and verified houses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-sm space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center mx-auto mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#2B1E16]">Global Delivery</h4>
            <p className="text-xs text-[#7A6E65] leading-relaxed">
              Fully insured express transit directly to your door, complete with real-time tracking updates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-sm space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#2B1E16]">Client First</h4>
            <p className="text-xs text-[#7A6E65] leading-relaxed">
              Seamless 7-day returns, dedicated personal shoppers, and around-the-clock priority customer care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

