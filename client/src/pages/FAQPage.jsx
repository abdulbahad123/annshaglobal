import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  Compass, 
  User, 
  Phone, 
  Plus, 
  Minus, 
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import PreFooterNewsletter from '../components/common/PreFooterNewsletter';

export default function FAQPage({ faqs = [], config = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Expanded FAQ state (by category and item index)
  const [openItems, setOpenItems] = useState({
    'General Questions-2': true // "Is my personal information secure?" open by default per reference image
  });

  // Dynamic CMS fields with faithful screenshot defaults
  const heroTitle = config.title || 'Frequently Asked Questions';
  const heroSubtitle = config.subtitle || 'Find quick answers to your questions';
  const heroBg = config.heroBg || '/images/faqherobaner.png';

  const defaultCategories = [
    {
      category: 'General Questions',
      items: [
        {
          question: 'What is ANNSHA GLOBAL?',
          answer: 'ANNSHA GLOBAL is an international luxury destination connecting discerning patrons with authenticated lifestyle fashion, home appointments, artisanal decor, and fine bespoke gifts.'
        },
        {
          question: 'How can I create an account?',
          answer: 'Click on the Account icon in the top header and select "Create Account". Enter your name, email, phone number, and password to instantly access your verified member portal and customer benefits.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, your personal information is 100% secure with us. We use advanced security measures to protect your data.'
        }
      ]
    },
    {
      category: 'Orders & Shipping',
      items: [
        {
          question: 'How long does shipping take and how do I track my order?',
          answer: 'Standard domestic shipments arrive in 3-5 business days. International express orders arrive within 5-7 business days with end-to-end GPS carrier tracking sent directly to your email.'
        },
        {
          question: 'Do you offer free shipping on luxury orders?',
          answer: 'Yes! All orders above $50 or ₹499 qualify for complimentary insured express shipping worldwide.'
        }
      ]
    },
    {
      category: 'Returns & Refunds',
      items: [
        {
          question: 'What is the return policy?',
          answer: 'We provide an effortless 7-day return guarantee. Items must be in their original, unused state with all authenticity tags and luxury packaging intact.'
        },
        {
          question: 'How soon are refunds processed?',
          answer: 'Approved refunds are credited back to your original payment method or instant UPI within 24 to 48 hours following inspection.'
        }
      ]
    },
    {
      category: 'Payments',
      items: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We support all major debit/credit cards (Visa, MasterCard, American Express), UPI (Google Pay, PhonePe, Paytm), Net Banking, and Razorpay secure payment gateway.'
        },
        {
          question: 'Is online checkout 100% encrypted?',
          answer: 'Yes, all payment data is processed through PCI-DSS Level 1 compliant gateways using bank-grade 256-bit SSL encryption.'
        }
      ]
    },
    {
      category: 'Products & Quality',
      items: [
        {
          question: 'Are all products certified authentic?',
          answer: 'Every single product sold on ANNSHA GLOBAL is 100% genuine and certified by specialized luxury appraisers and verified global houses.'
        }
      ]
    },
    {
      category: 'Offers & Discounts',
      items: [
        {
          question: 'How do I apply coupon codes and gift vouchers?',
          answer: 'Enter your coupon code in the "Gift Cards & Promo Code" field at checkout and click "Apply" to receive instant discounts on your order total.'
        }
      ]
    },
    {
      category: 'Contact & Support',
      items: [
        {
          question: 'How do I reach the 24/7 concierge support team?',
          answer: 'Our customer advisors are available around the clock via live chat, telephone at +1 (555) 123-4567, or through our Contact Us page.'
        }
      ]
    }
  ];

  // If dynamic FAQs are provided in flat format, group them by category; otherwise use structured defaults
  let categorizedFaqs = defaultCategories;
  if (faqs && faqs.length > 0 && faqs[0].category && faqs[0].question) {
    const map = {};
    faqs.forEach(f => {
      const cat = f.category || 'General Questions';
      if (!map[cat]) map[cat] = [];
      map[cat].push({ question: f.question, answer: f.answer });
    });
    categorizedFaqs = Object.keys(map).map(cat => ({ category: cat, items: map[cat] }));
  }

  const toggleItem = (key) => {
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Quick Links
  const quickLinks = [
    { label: 'Shipping Info', icon: Truck, targetCategory: 'Orders & Shipping' },
    { label: 'Return & Refund', icon: RotateCcw, targetCategory: 'Returns & Refunds' },
    { label: 'Payment Methods', icon: CreditCard, targetCategory: 'Payments' },
    { label: 'Order Tracking', icon: Compass, targetCategory: 'Orders & Shipping' },
    { label: 'Account Help', icon: User, targetCategory: 'General Questions' },
    { label: 'Contact Us', icon: Phone, targetCategory: 'Contact & Support', link: '/contact' }
  ];

  // Filtering based on search and activeCategory
  const filteredCategories = categorizedFaqs
    .map(group => {
      if (activeCategory !== 'All' && group.category !== activeCategory) {
        return null;
      }
      const filteredItems = group.items.filter(item => {
        const matchesSearch = !searchTerm || 
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
      return filteredItems.length > 0 ? { ...group, items: filteredItems } : null;
    })
    .filter(Boolean);

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

      {/* 2. BREADCRUMB BAR (Matches Screenshot: Home > FAQ) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-[#7A6E65]">
        <a href="/" className="flex items-center gap-1 hover:text-[#704214] transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </a>
        <span>›</span>
        <span className="font-semibold text-[#704214]">FAQ</span>
      </div>

      {/* 3. MAIN DUAL-COLUMN FAQ WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR (approx 4 cols desktop): Quick Links + Need More Help Concierge */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* A. Quick Links Card */}
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADBCC] p-5 sm:p-6 shadow-xs space-y-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B1E16] pb-2 border-b border-[#EADBCC]">
                Quick Links
              </h3>
              <div className="space-y-1">
                {quickLinks.map((ql, idx) => {
                  const Icon = ql.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (ql.link) {
                          window.location.href = ql.link;
                        } else {
                          setActiveCategory(ql.targetCategory);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                        activeCategory === ql.targetCategory
                          ? 'bg-[#FAF5EE] text-[#704214] border border-[#EADBCC]'
                          : 'text-[#605248] hover:text-[#704214] hover:bg-[#FAF5EE]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#704214] shrink-0" />
                      <span>{ql.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('All')}
                  className="w-full text-center text-[11px] font-bold text-[#704214] hover:underline pt-2"
                >
                  View All Categories
                </button>
              )}
            </div>

            {/* B. "Need More Help?" Support Card with Portrait (Matches Screenshot!) */}
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADBCC] p-5 shadow-xs overflow-hidden relative">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <h4 className="font-serif text-base font-bold text-[#2B1E16]">
                    Need More Help?
                  </h4>
                  <p className="text-[11px] text-[#7A6E65]">
                    Our support team is here for you!
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#704214] hover:bg-[#59330E] text-white text-[11px] font-semibold shadow-xs transition-all active:scale-95 mt-1"
                  >
                    <span>Contact Us</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                {/* Customer Support Representative Smiling Portrait */}
                <div className="w-20 h-24 rounded-2xl overflow-hidden shrink-0 border border-[#EADBCC] shadow-xs">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                    alt="Annsha Customer Support Advisor"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (approx 8 cols desktop): Search Input + Categorized Accordions */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Top Search Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your question..."
                className="w-full pl-5 pr-12 py-3 bg-[#FFFDF9] border border-[#EADBCC] rounded-full text-xs sm:text-sm text-[#2B1E16] placeholder-[#A4978C] focus:outline-none focus:border-[#704214] shadow-xs"
              />
              <button
                type="button"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#704214] hover:bg-[#59330E] text-white flex items-center justify-center transition-colors"
                aria-label="Search FAQ"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Categorized FAQ Groups */}
            <div className="space-y-4">
              {filteredCategories.length === 0 ? (
                <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADBCC] p-8 text-center space-y-2">
                  <HelpCircle className="w-8 h-8 text-[#A4978C] mx-auto" />
                  <p className="font-serif font-bold text-sm text-[#2B1E16]">
                    No matching questions found
                  </p>
                  <p className="text-xs text-[#7A6E65]">
                    Try adjusting your search terms or contact our concierge team.
                  </p>
                </div>
              ) : (
                filteredCategories.map((group) => (
                  <div 
                    key={group.category}
                    className="rounded-2xl border border-[#EADBCC] bg-[#FFFDF9] overflow-hidden shadow-xs"
                  >
                    {/* Category Title Header Bar */}
                    <div className="px-5 py-3.5 bg-[#FAF5EE] border-b border-[#EADBCC] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[#C59B27] font-bold text-xs">✦</span>
                        <h3 className="font-serif text-xs sm:text-sm font-bold text-[#2B1E16] tracking-wide">
                          {group.category}
                        </h3>
                      </div>
                      <span className="text-[10px] text-[#7A6E65] font-semibold">
                        {group.items.length} {group.items.length === 1 ? 'topic' : 'topics'}
                      </span>
                    </div>

                    {/* Accordion Items under this Category */}
                    <div className="divide-y divide-[#EADBCC]/60">
                      {group.items.map((item, idx) => {
                        const itemKey = `${group.category}-${idx}`;
                        const isOpen = !!openItems[itemKey];

                        return (
                          <div key={idx} className="transition-colors">
                            {/* Accordion Question Row */}
                            <button
                              type="button"
                              onClick={() => toggleItem(itemKey)}
                              className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 hover:bg-[#FAF5EE]/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-[#704214] font-bold text-sm shrink-0">
                                  {isOpen ? '−' : '+'}
                                </span>
                                <span className={`text-xs sm:text-sm font-medium ${isOpen ? 'text-[#704214] font-bold' : 'text-[#2B1E16]'}`}>
                                  {item.question}
                                </span>
                              </div>
                              <span className="text-[#7A6E65] shrink-0 text-xs">
                                {isOpen ? (
                                  <Minus className="w-3.5 h-3.5 text-[#704214]" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5 text-[#7A6E65]" />
                                )}
                              </span>
                            </button>

                            {/* Accordion Answer Content */}
                            {isOpen && (
                              <div className="px-5 pb-4 pt-1 pl-10 text-xs sm:text-sm text-[#605248] leading-relaxed border-t border-[#EADBCC]/30 bg-[#FFFDF9]">
                                {item.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      </main>

      {/* 4. PRE-FOOTER NEWSLETTER BAR (Matches Reference Screenshot) */}
      <PreFooterNewsletter />
    </div>
  );
}
