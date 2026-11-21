import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';

export default function FAQPage({ faqs = [], config = {} }) {
  const [activeId, setActiveId] = useState(1);
  const [search, setSearch] = useState('');

  const fallbackFaqs = [
    {
      id: 1,
      category: 'Shipping',
      question: 'How long does shipping take and how do I track my order?',
      answer: 'Standard domestic orders arrive within 3-5 business days, while international express shipments arrive within 5-7 business days. As soon as your order ships from our boutique fulfillment center, you will receive an email containing your tracking number and live carrier link.'
    },
    {
      id: 2,
      category: 'Shipping',
      question: 'Do you offer free shipping on luxury orders?',
      answer: 'Yes! All orders above $50 qualify for complimentary insured standard shipping worldwide. Orders under $50 are charged a flat rate of $5.00.'
    },
    {
      id: 3,
      category: 'Returns',
      question: 'What is the Annsha Global return policy?',
      answer: 'We offer an easy 7-day return guarantee. If you are not completely satisfied with your purchase, you may initiate a return within 7 days of delivery. Items must be in their original, unused condition with all authenticity tags and luxury packaging intact.'
    },
    {
      id: 4,
      category: 'Payment',
      question: 'What payment methods do you accept and is checkout secure?',
      answer: 'We accept major credit cards (Visa, MasterCard, American Express) through Stripe, PayPal Express Checkout, and Cash on Delivery (COD) in eligible regions. All transactions are protected by bank-level 256-bit SSL encryption.'
    },
    {
      id: 5,
      category: 'Authenticity',
      question: 'Are all products certified authentic?',
      answer: 'Absolutely. Every single product sold on Annsha Global is 100% genuine and verified by certified luxury appraisers and authorized global distributors.'
    },
    {
      id: 6,
      category: 'Orders',
      question: 'Can I cancel or modify my order after placing it?',
      answer: 'Orders can be modified or cancelled within 2 hours of placement by contacting our 24/7 customer concierge team directly via live chat or email.'
    }
  ];

  const items = (faqs && faqs.length > 0) ? faqs : fallbackFaqs;
  const tagline = config?.tagline || 'CUSTOMER CONCIERGE';
  const headerTitle = config?.title || 'Frequently Asked Questions';
  const headerSubtitle = config?.subtitle || 'Find instant answers to questions regarding order tracking, luxury delivery, returns, and payment options.';

  const filteredFaqs = items.filter(f =>
    f.question?.toLowerCase().includes(search.toLowerCase()) ||
    f.answer?.toLowerCase().includes(search.toLowerCase()) ||
    f.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#FAF5EE] text-[#704214] flex items-center justify-center mx-auto shadow-sm">
          <HelpCircle className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#704214] uppercase">
          {tagline}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1E16]">
          {headerTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6E65] max-w-md mx-auto">
          {headerSubtitle}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-lg mx-auto">
        <Search className="w-4 h-4 text-[#A4978C] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search questions (e.g. shipping, returns, payment)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#FFFDF9] border border-[#EADBCC] rounded-full text-xs text-[#2B1E16] placeholder-[#A4978C] focus:outline-none focus:border-[#704214] shadow-sm"
        />
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = activeId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-2xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveId(isOpen ? null : faq.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-[#2B1E16] hover:text-[#704214] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 bg-[#FAF5EE] text-[#704214] rounded-full">
                    {faq.category}
                  </span>
                  <span>{faq.question}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#7A6E65] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#704214]' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#605248] leading-relaxed border-t border-[#F5EBE1]">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

