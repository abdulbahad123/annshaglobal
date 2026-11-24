import React from 'react';
import { Gem, ShieldCheck, Headphones, Shirt, Sparkles, ArrowRight } from 'lucide-react';
import PreFooterNewsletter from '../components/common/PreFooterNewsletter';

export default function OurBrandPage({ config = {} }) {
  // Dynamic CMS fields with faithful screenshot defaults
  const heroTagline = config.heroTagline || config.tagline || 'More Than a Brand —';
  const heroSubtitle = config.heroSubtitle || config.subtitle || 'A Lifestyle of Elegance';
  const heroTitle = config.heroTitle || config.title || 'Our Brand';
  const heroBg = config.heroBg || '/images/ourbrand.png';

  const aboutTitle = config.aboutTitle || 'About ANNSHA GLOBAL';
  const aboutP1 = config.aboutP1 || 'At ANNSHA GLOBAL, we believe in more than just shopping — we believe in expressing yourself. Our brand is founded on the principles of elegance, quality, and trust, offering a curated selection of fashion, home, beauty, and lifestyle products that bring joy to your everyday life.';
  const aboutP2 = config.aboutP2 || 'With a commitment to premium quality, exceptional service, and timeless style, ANNSHA GLOBAL is your destination for a more beautiful and inspired life.';
  const aboutButtonText = config.aboutButtonText || 'Discover Our Story →';
  const aboutModelImage = config.aboutModelImage || '/images/sliderimage1.webp';

  const brandValuesTitle = config.brandValuesTitle || 'Our Brand Values';
  const brandValues = config.brandValues || [
    {
      id: 1,
      title: 'Premium Quality',
      subtitle: 'Only the finest, for you.',
      icon: 'gem'
    },
    {
      id: 2,
      title: 'Trusted Brand',
      subtitle: 'Shop with confidence.',
      icon: 'shield'
    },
    {
      id: 3,
      title: 'Customer First',
      subtitle: 'Always here for you.',
      icon: 'support'
    },
    {
      id: 4,
      title: 'Timeless Style',
      subtitle: 'Because you deserve more.',
      icon: 'style'
    }
  ];

  const experienceTitle = config.experienceTitle || 'The ANNSHA GLOBAL Experience';
  const experienceSubtitle = config.experienceSubtitle || 'Shop smarter. Live more beautifully.';
  const experienceCards = config.experienceCards || [
    {
      id: 1,
      title: 'Fashion',
      image: '/images/categories/fashion-apparel.webp',
      link: '/shop?category=fashion-apparel'
    },
    {
      id: 2,
      title: 'Home Decor',
      image: '/images/Beige Armchair and Potted Plant Set.png',
      link: '/shop?category=home-living'
    },
    {
      id: 3,
      title: 'Beauty & Skincare',
      image: '/images/Elegant Botanical Skincare Collection.png',
      link: '/shop?category=beauty-care'
    },
    {
      id: 4,
      title: 'Gifts & More',
      image: '/images/Luxurious Golden Gift Box with Bow.png',
      link: '/shop?category=gifts-more'
    }
  ];

  const renderValueIcon = (icon) => {
    switch (icon) {
      case 'gem':
        return <Gem className="w-5 h-5 text-white" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-white" />;
      case 'support':
        return <Headphones className="w-5 h-5 text-white" />;
      case 'style':
      default:
        return <Shirt className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] text-[#2B1E16] selection:bg-[#704214] selection:text-white">
      {/* 1. TOP HERO BANNER (Full Background Image per Task 2) */}
      <section 
        className="relative w-full border-b border-[#EADBCC] overflow-hidden bg-cover bg-no-repeat bg-right lg:bg-center min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] flex items-center"
        style={{
          backgroundImage: `url("${encodeURI(heroBg)}")`,
          backgroundColor: '#FAF5EE'
        }}
      >
        {/* Soft champagne gradient overlay on the left to keep typography perfectly crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF5EE]/95 via-[#FAF5EE]/80 to-transparent w-full md:w-3/5 lg:w-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full relative z-10">
          {/* Left Text Column directly above the background */}
          <div className="max-w-xl text-left space-y-2.5 sm:space-y-3.5">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#2B1E16] tracking-tight drop-shadow-xs">
              {heroTitle}
            </h1>
            <p className="font-serif text-base sm:text-xl lg:text-2xl text-[#704214] font-medium leading-relaxed">
              {heroTagline} <br className="hidden sm:inline" />
              <span className="italic">{heroSubtitle}</span>
            </p>
            {/* Ornamental Diamond Flourish Divider */}
            <div className="flex items-center gap-2 pt-1 sm:pt-2">
              <div className="w-12 sm:w-16 h-px bg-[#C59B27]"></div>
              <div className="w-2 h-2 rotate-45 bg-[#C59B27]"></div>
              <div className="w-12 sm:w-16 h-px bg-[#C59B27]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT ANNSHA GLOBAL SECTION (3-Card Layout per Reference Image 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: Fashion Model with Annsha Luxury Shopping Bags (approx 4 cols) */}
          <div className="lg:col-span-4 rounded-3xl overflow-hidden shadow-sm border border-[#EADBCC] bg-[#FFFDF9] min-h-[320px] sm:min-h-[380px] relative group">
            <img
              src={aboutModelImage}
              alt="Annsha Global Luxury Lifestyle"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/sliderimage1.png';
              }}
            />
            {/* Soft ambient gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1E16]/30 via-transparent to-transparent pointer-events-none"></div>
          </div>

          {/* Card 2: About Story & Mission (approx 5 cols) */}
          <div className="lg:col-span-5 rounded-3xl p-6 sm:p-8 lg:p-10 bg-[#FFFDF9] border border-[#EADBCC] shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16]">
                {aboutTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#605248] leading-relaxed">
                {aboutP1}
              </p>
              <p className="text-xs sm:text-sm text-[#605248] leading-relaxed">
                {aboutP2}
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  const shopLink = document.querySelector('a[href="/shop"]');
                  if (shopLink) shopLink.click();
                  else window.location.href = '/shop';
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#704214] hover:bg-[#59330E] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
              >
                <span>{aboutButtonText}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Luxury AG Monogram Gold Emblem (approx 3 cols) */}
          <div className="lg:col-span-3 rounded-3xl p-6 sm:p-8 bg-[#FFFDF9] border border-[#EADBCC] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Subtle luxury ambient circle */}
            <div className="absolute w-44 h-44 rounded-full bg-[#FAF5EE] -top-10 -right-10 pointer-events-none"></div>
            
            {/* Golden Laurel Branch Wreath & AG Monogram Vector */}
            <div className="relative z-10 space-y-3">
              <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                {/* SVG Laurel Leaf Branches */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#C59B27] drop-shadow-xs">
                  {/* Left Wreath Branch */}
                  <path
                    d="M 28 75 C 16 60, 16 38, 30 25 C 27 32, 28 42, 33 48 C 30 52, 28 62, 36 70 Z"
                    fill="currentColor"
                    opacity="0.85"
                  />
                  {/* Right Wreath Branch */}
                  <path
                    d="M 72 75 C 84 60, 84 38, 70 25 C 73 32, 72 42, 67 48 C 70 52, 72 62, 64 70 Z"
                    fill="currentColor"
                    opacity="0.85"
                  />
                  {/* Central Monogram AG */}
                  <text
                    x="37"
                    y="60"
                    fontFamily="Playfair Display, serif"
                    fontSize="36"
                    fontWeight="700"
                    fill="#704214"
                  >
                    A
                  </text>
                  <text
                    x="48"
                    y="66"
                    fontFamily="Playfair Display, serif"
                    fontSize="32"
                    fontWeight="600"
                    fill="#C59B27"
                  >
                    G
                  </text>
                  {/* Tiny 4-point sparkle top right */}
                  <path
                    d="M 76 18 Q 78 22 82 22 Q 78 22 76 26 Q 76 22 72 22 Q 76 22 76 18 Z"
                    fill="#C59B27"
                  />
                </svg>
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-[#2B1E16] tracking-widest uppercase">
                  ANNSHA GLOBAL
                </h3>
                <span className="text-[10px] text-[#7A6E65] font-semibold tracking-wider uppercase block mt-0.5">
                  YOUR WORLD, YOUR CHOICE
                </span>
              </div>

              {/* Cursive Signature Script */}
              <div className="pt-2">
                <span className="font-serif italic text-base sm:text-lg text-[#704214] font-medium block">
                  Elegance in Every Choice
                </span>
                <div className="w-16 h-px bg-[#C59B27]/50 mx-auto mt-1"></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. OUR BRAND VALUES SECTION (4 Cards Grid per Reference Image 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Section Header with Ornamental Dividers */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-10">
          <div className="flex-1 max-w-[120px] sm:max-w-[200px] h-px bg-[#EADBCC]"></div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rotate-45 bg-[#C59B27]"></div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#2B1E16] tracking-tight whitespace-nowrap">
              {brandValuesTitle}
            </h2>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#C59B27]"></div>
          </div>
          <div className="flex-1 max-w-[120px] sm:max-w-[200px] h-px bg-[#EADBCC]"></div>
        </div>

        {/* 4 Brand Values Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {brandValues.map((val) => (
            <div
              key={val.id}
              className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADBCC] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-3 group hover:border-[#C59B27]/60"
            >
              {/* Circular Brown Icon Container matching Screenshot */}
              <div className="w-12 h-12 rounded-full bg-[#704214] flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110">
                {renderValueIcon(val.icon)}
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B1E16]">
                  {val.title}
                </h3>
                <p className="text-xs text-[#7A6E65] mt-1">
                  {val.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THE ANNSHA GLOBAL EXPERIENCE (4 Collection Cards Grid per Reference Image 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        {/* Section Heading */}
        <div className="text-center space-y-1.5 mb-8 sm:mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2B1E16]">
            {experienceTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6E65]">
            {experienceSubtitle}
          </p>
        </div>

        {/* 4 Experience Collection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {experienceCards.map((card) => (
            <a
              key={card.id}
              href={card.link || '/shop'}
              className="group block rounded-2xl bg-[#FFFDF9] border border-[#EADBCC] overflow-hidden shadow-xs hover:shadow-md transition-all text-center"
            >
              {/* Image Container with Smooth Zoom */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#FAF5EE] relative flex items-center justify-center p-3">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/sliderimage2.webp';
                  }}
                />
              </div>

              {/* Bottom Label Bar */}
              <div className="py-3 px-4 border-t border-[#EADBCC]/60 bg-[#FFFDF9] group-hover:bg-[#FAF5EE] transition-colors">
                <span className="font-serif text-xs sm:text-sm font-bold text-[#2B1E16] group-hover:text-[#704214] transition-colors">
                  {card.title}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 5. PRE-FOOTER NEWSLETTER BAR (Matches all reference images) */}
      <PreFooterNewsletter />
    </div>
  );
}
