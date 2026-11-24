import React, { useState } from 'react';
import { Mail, Facebook, Instagram, Youtube, Linkedin, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import footerCtaLeft from '../../images/footercta_leftside.png';
import footerCtaRight from '../../images/footercta_rightside.png';

// Custom Pinterest SVG
function PinterestIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.94-.12-2.38.03-3.41l.9-3.83s-.23-.46-.23-1.14c0-1.07.62-1.87 1.4-1.87.66 0 .98.5.98 1.1 0 .67-.42 1.66-.64 2.58-.18.78.39 1.41 1.16 1.41 1.39 0 2.46-1.47 2.46-3.58 0-1.87-1.34-3.18-3.26-3.18-2.38 0-3.78 1.79-3.78 3.63 0 .72.28 1.49.62 1.91.07.08.08.15.06.24l-.23.97c-.04.15-.13.18-.3.11-1.11-.52-1.8-2.14-1.8-3.44 0-2.8 2.04-5.38 5.88-5.38 3.09 0 5.49 2.2 5.49 5.14 0 3.07-1.93 5.54-4.62 5.54-.9 0-1.75-.47-2.04-1.02l-.56 2.12c-.2 0.78-.74 1.75-1.1 2.34A12 12 0 1 0 12 0z" />
    </svg>
  );
}

export default function Newsletter({ config = {} }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const heading = config?.heading || 'Subscribe to Our Newsletter';
  const subtitle = config?.subtitle || 'Get the latest updates on new arrivals and special offers.';
  const buttonText = config?.buttonText || 'Subscribe';

  const [subMsg, setSubMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await axiosClient.post('/subscribers', { email, source: 'homepage_newsletter' });
      setSubscribed(true);
      setSubMsg(res.message || 'Subscribed successfully!');
      setTimeout(() => {
        setSubscribed(false);
        setSubMsg('');
        setEmail('');
      }, 5000);
    } catch (err) {
      alert(err.message || 'Failed to subscribe. Please try again.');
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8">
      {/* Dual Cards matching Reference Image 2 pixel by pixel */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4 sm:gap-6">
        
        {/* CARD 1 (LEFT): Subscribe to Our Newsletter with full background image */}
        <div 
          className="flex-1 relative rounded-2xl sm:rounded-3xl border border-[#EADBCC] overflow-hidden p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
          style={{
            backgroundImage: `url(${footerCtaLeft})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Subtle warm wash overlay to ensure crisp contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/30 pointer-events-none" />

          {/* Headline & Icon */}
          <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-white/95 border border-[#EADBCC] flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-6 h-6 text-[#704214]" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-[#2B1E16] tracking-tight">
                {heading}
              </h2>
              <p className="text-xs text-[#605248] mt-0.5 max-w-sm">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 w-full md:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 sm:px-5 py-2.5 rounded-full bg-white/95 border border-[#E7DACD] text-xs sm:text-sm text-[#2B1E16] placeholder-[#8C7D73] focus:outline-none focus:border-[#704214] shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 sm:px-7 py-2.5 bg-[#593014] hover:bg-[#43230C] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm shrink-0 active:scale-95"
            >
              {subscribed ? '✓ Subscribed' : buttonText}
            </button>
          </form>
        </div>

        {/* CARD 2 (RIGHT): Follow Us with full background image */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl border border-[#EADBCC] overflow-hidden p-6 sm:p-8 flex flex-col justify-center items-center gap-3 shadow-sm shrink-0 min-w-[260px] sm:min-w-[280px]"
          style={{
            backgroundImage: `url(${footerCtaRight})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Subtle warm wash overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-white/30 to-transparent pointer-events-none" />

          <span className="relative z-10 font-serif text-sm sm:text-base font-bold text-[#2B1E16]">
            Follow Us
          </span>

          {/* 5 solid dark brown circular social buttons matching Reference Image 2 */}
          <div className="relative z-10 flex items-center gap-2.5">
            <a 
              href="#" 
              aria-label="Facebook"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#593014] hover:bg-[#43230C] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
            >
              <Facebook className="w-3.5 h-3.5 fill-current" />
            </a>
            <a 
              href="#" 
              aria-label="Instagram"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#593014] hover:bg-[#43230C] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a 
              href="#" 
              aria-label="YouTube"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#593014] hover:bg-[#43230C] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
            >
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <a 
              href="#" 
              aria-label="Pinterest"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#593014] hover:bg-[#43230C] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
            >
              <PinterestIcon className="w-3.5 h-3.5" />
            </a>
            <a 
              href="#" 
              aria-label="LinkedIn"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#593014] hover:bg-[#43230C] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
            >
              <Linkedin className="w-3.5 h-3.5 fill-current" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
