import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Gift } from 'lucide-react';

export default function TrustBadges({ valueProps = [] }) {
  const iconList = [
    <Truck className="w-5 h-5 text-[#704214]" />,
    <ShieldCheck className="w-5 h-5 text-[#704214]" />,
    <RotateCcw className="w-5 h-5 text-[#704214]" />,
    <Gift className="w-5 h-5 text-[#704214]" />
  ];

  const defaultBadges = [
    { title: 'Free Shipping', subtitle: 'On All Orders' },
    { title: 'Secure Payments', subtitle: '100% Secure' },
    { title: 'Easy Returns', subtitle: 'Within 7 Days' },
    { title: 'Exclusive Offers', subtitle: 'Save More' }
  ];

  const badges = (valueProps && valueProps.length > 0) ? valueProps : defaultBadges;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
        {badges.map((b, i) => (
          <div
            key={i}
            className={`items-center gap-2.5 sm:gap-3.5 p-2.5 sm:p-4 rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-sm hover:border-[#D9C8B5] transition-all ${i === 3 ? 'hidden md:flex' : 'flex'}`}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F5EBE1] flex items-center justify-center shrink-0">
              {iconList[i % iconList.length]}
            </div>
            <div className="min-w-0">
              <h2 className="text-[11px] sm:text-sm font-semibold text-[#2B1E16] leading-tight truncate">
                {b.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-[#7A6E65] mt-0.5 font-normal truncate">
                {b.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
