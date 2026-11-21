import React from 'react';

export default function BrandSlider({ brands = [] }) {
  const defaultBrands = [
    { name: 'Nike', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
    { name: 'Adidas', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
    { name: 'Samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    { name: 'Apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Puma', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_logo.svg' },
    { name: 'Levi\'s', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Levi%27s_logo.svg' },
    { name: 'Zara', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg' },
    { name: 'H&M', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg' },
    { name: 'IKEA', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg' },
    { name: 'Flipkart', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg' }
  ];

  const brandList = brands.length > 0 ? brands : defaultBrands;

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2B1E16] tracking-tight">
          Our Brands
        </h2>
        <span className="w-12 h-[1px] bg-[#C59B27]"></span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        {brandList.map((brand, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-24 sm:w-28 h-12 sm:h-14 rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] px-3 py-2 flex items-center justify-center shadow-sm hover:border-[#704214]/30 transition-all"
          >
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="max-h-6 sm:max-h-7 max-w-[80px] object-contain filter grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

