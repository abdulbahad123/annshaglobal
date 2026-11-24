import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function PreFooterNewsletter({ onSubscribe }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    if (onSubscribe) onSubscribe(email);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 4000);
  };

  return (
    <section className="w-full bg-[#F5ECE0] border-t border-b border-[#EADBCC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative overflow-hidden">
      {/* Decorative floral leaf flourishes on corners */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Left: Newsletter Headline & Subtitle */}
        <div className="flex items-center gap-3.5 text-center lg:text-left">
          <div className="w-10 h-10 rounded-full bg-[#704214] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B1E16]">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-xs text-[#7A6E65]">
              Get the latest updates on new arrivals and special offers.
            </p>
          </div>
        </div>

        {/* Center: Subscription Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md flex items-center gap-2">
          {subscribed ? (
            <div className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you for subscribing to Annsha Global!</span>
            </div>
          ) : (
            <div className="w-full flex items-center bg-white rounded-full border border-[#EADBCC] p-1 shadow-xs focus-within:border-[#704214] focus-within:ring-2 focus-within:ring-[#704214]/15 transition-all">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-4 pr-2 py-1.5 text-xs text-[#2B1E16] placeholder-[#A4978C] bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-bold tracking-wide transition-all shadow-xs shrink-0 active:scale-95"
              >
                Subscribe
              </button>
            </div>
          )}
        </form>

        {/* Right: Follow Us Social Media Icons */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#605248]">Follow Us</span>
          <div className="flex items-center gap-2">
            {[
              { id: 'fb', label: 'Facebook', icon: 'f', url: 'https://facebook.com' },
              { id: 'ig', label: 'Instagram', icon: '📸', url: 'https://instagram.com' },
              { id: 'yt', label: 'YouTube', icon: '▶', url: 'https://youtube.com' },
              { id: 'in', label: 'LinkedIn', icon: 'in', url: 'https://linkedin.com' },
              { id: 'pt', label: 'Pinterest', icon: 'P', url: 'https://pinterest.com' }
            ].map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="w-7 h-7 rounded-full bg-[#704214] hover:bg-[#59330E] text-white flex items-center justify-center text-xs font-bold transition-all hover:scale-110 shadow-xs"
              >
                <span className="text-[11px] font-sans leading-none">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

