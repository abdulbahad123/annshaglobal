import React, { useState } from 'react';
import {
  Home,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import PreFooterNewsletter from '../components/common/PreFooterNewsletter';

export default function ContactUsPage({ config = {} }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic CMS fields with faithful screenshot defaults
  const heroTitle = config.title || 'Contact Us';
  const heroSubtitle = config.subtitle || "We'd Love to Hear from You";
  const heroBg = config.heroBg || '/images/contactus_herobanner.png';

  const address = config.address || '123 Fashion Street, New York, NY 10001';
  const phone = config.phone || '+1 (555) 123 - 4567';
  const email = config.email || 'support@annshaglobal.com';
  const hoursWeekday = config.hoursWeekday || 'Mon - Sat: 9:00 AM - 8:00 PM';
  const hoursWeekend = config.hoursWeekend || 'Sun: 10:00 AM - 6:00 PM';

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 800);
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
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2B1E16] tracking-tight drop-shadow-xs">
              {heroTitle}
            </h1>
            <p className="font-serif text-base sm:text-lg lg:text-xl text-[#704214] font-medium leading-relaxed">
              {heroSubtitle}
            </p>
            {/* Ornamental Diamond Flourish */}
            <div className="flex items-center gap-2 pt-1 sm:pt-2">
              <div className="w-12 sm:w-16 h-px bg-[#C59B27]"></div>
              <div className="w-2 h-2 rotate-45 bg-[#C59B27]"></div>
              <div className="w-12 sm:w-16 h-px bg-[#C59B27]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BREADCRUMB BAR (Matches Screenshot: Home > Contact Us) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-[#7A6E65]">
        <a href="/" className="flex items-center gap-1 hover:text-[#704214] transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </a>
        <span>›</span>
        <span className="font-semibold text-[#704214]">Contact Us</span>
      </div>

      {/* 3. MAIN CONTACT WORKSPACE (Left Contact Info + Right Form & Promo Card) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN (approx 4.5 cols desktop): "Get in Touch" Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFFDF9] rounded-3xl border border-[#EADBCC] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1E16]">
                  Get in Touch
                </h3>
                <p className="text-xs text-[#7A6E65] mt-2 leading-relaxed">
                  We're here to help! Reach out to us for any questions, feedback, or support. Our team will get back to you as soon as possible.
                </p>
              </div>

              {/* Contact Details List */}
              <div className="space-y-4 pt-1">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0 border border-[#EADBCC]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2B1E16] block">Our Address</span>
                    <span className="text-xs text-[#7A6E65] block mt-0.5">{address}</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0 border border-[#EADBCC]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2B1E16] block">Call Us</span>
                    <span className="text-xs text-[#7A6E65] block mt-0.5">{phone}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0 border border-[#EADBCC]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2B1E16] block">Email Us</span>
                    <span className="text-xs text-[#7A6E65] block mt-0.5">{email}</span>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0 border border-[#EADBCC]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2B1E16] block">Business Hours</span>
                    <span className="text-xs text-[#7A6E65] block mt-0.5">{hoursWeekday}</span>
                    <span className="text-xs text-[#7A6E65] block">{hoursWeekend}</span>
                  </div>
                </div>
              </div>

              {/* Follow Us Row (Matches Reference Image 3 Right) */}
              <div className="pt-4 border-t border-[#EADBCC] space-y-2.5">
                <span className="font-bold text-xs text-[#2B1E16] block">Follow Us</span>
                <p className="text-[11px] text-[#7A6E65]">
                  Stay connected with us on social media for updates, exclusive offers and more!
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-7 h-7 rounded-full bg-[#704214] hover:bg-[#59330E] text-white flex items-center justify-center text-xs transition-colors"
                  >
                    f
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-7 h-7 rounded-full bg-[#704214] hover:bg-[#59330E] text-white flex items-center justify-center text-xs transition-colors"
                  >
                    📸
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="w-7 h-7 rounded-full bg-[#704214] hover:bg-[#59330E] text-white flex items-center justify-center text-xs transition-colors"
                  >
                    ▶
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="w-7 h-7 rounded-full bg-[#704214] hover:bg-[#59330E] text-white flex items-center justify-center text-xs transition-colors"
                  >
                    in
                  </a>
                  <a
                    href="https://pinterest.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Pinterest"
                    className="w-7 h-7 rounded-full bg-[#704214] hover:bg-[#59330E] text-white flex items-center justify-center text-xs transition-colors"
                  >
                    P
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (approx 7.5 cols desktop): "Send Us a Message" Form + "Let's Stay Connected" Promo Card */}
          <div className="lg:col-span-7 space-y-6">

            {/* Form Card */}
            <div className="bg-[#FFFDF9] rounded-3xl border border-[#EADBCC] p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2B1E16]">
                Send Us a Message
              </h3>

              {isSuccess ? (
                <div className="p-6 rounded-2xl bg-[#FAF5EE] border border-[#C59B27] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#704214] mx-auto" />
                  <p className="font-serif font-bold text-sm text-[#2B1E16]">
                    Thank You for Reaching Out
                  </p>
                  <p className="text-xs text-[#7A6E65]">
                    Your message has been received. Our concierge team will reply within 2 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Your Name */}
                  <div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your Name *"
                      className="w-full px-4 py-3 bg-[#FAF5EE] border border-[#EADBCC] rounded-xl text-xs sm:text-sm text-[#2B1E16] placeholder-[#A4978C] focus:outline-none focus:border-[#704214] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Your Email */}
                  <div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Your Email *"
                      className="w-full px-4 py-3 bg-[#FAF5EE] border border-[#EADBCC] rounded-xl text-xs sm:text-sm text-[#2B1E16] placeholder-[#A4978C] focus:outline-none focus:border-[#704214] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Subject"
                      className="w-full px-4 py-3 bg-[#FAF5EE] border border-[#EADBCC] rounded-xl text-xs sm:text-sm text-[#2B1E16] placeholder-[#A4978C] focus:outline-none focus:border-[#704214] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Your Message */}
                  <div>
                    <textarea
                      rows="4"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Your Message *"
                      className="w-full px-4 py-3 bg-[#FAF5EE] border border-[#EADBCC] rounded-xl text-xs sm:text-sm text-[#2B1E16] placeholder-[#A4978C] focus:outline-none focus:border-[#704214] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Send Message →'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* "Let's Stay Connected" Promo Card (Matches Screenshot!) */}
            <div className="bg-gradient-to-r from-[#FAF5EE] via-[#FFFDF9] to-[#FAF5EE] rounded-3xl border border-[#EADBCC] p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4 overflow-hidden relative">
              <div className="space-y-2 z-10">
                <h4 className="font-serif text-base sm:text-lg font-bold text-[#2B1E16]">
                  Let's Stay Connected
                </h4>
                <p className="text-xs text-[#7A6E65] max-w-sm">
                  Be the first to know about new arrivals, special offers and more.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const newsletterInput = document.querySelector('input[placeholder="Enter your email address"]');
                    if (newsletterInput) {
                      newsletterInput.scrollIntoView({ behavior: 'smooth' });
                      newsletterInput.focus();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#704214] hover:bg-[#59330E] text-white text-[11px] font-semibold shadow-xs transition-all active:scale-95 mt-1"
                >
                  <span>Subscribe Now →</span>
                </button>
              </div>

              {/* Luxurious Golden Gift Box with Bow Graphic */}
              <div className="w-24 sm:w-32 aspect-square shrink-0 relative flex items-center justify-center">
                <img
                  src="/images/Luxurious Golden Gift Box with Bow.png"
                  alt="Annsha Luxury Gift"
                  className="w-full h-full object-contain drop-shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/sliderimage2.webp';
                  }}
                />
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 4. PRE-FOOTER NEWSLETTER BAR (Matches Reference Screenshot) */}
      <PreFooterNewsletter />
    </div>
  );
}
