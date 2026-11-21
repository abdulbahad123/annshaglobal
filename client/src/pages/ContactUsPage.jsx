import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactUsPage({ config = {} }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const tagline = config?.tagline || 'CLIENT CONCIERGE';
  const headerTitle = config?.title || 'We Are Here to Assist You';
  const headerSubtitle = config?.subtitle || 'Have an inquiry about an order, styling recommendation, or bespoke request? Our luxury advisors are available 24 hours a day, 7 days a week.';
  const phone = config?.phone || '+1 (800) 849-2910';
  const email = config?.email || 'concierge@annshaglobal.com';
  const address = config?.address || '740 Madison Avenue, New York, NY 10065';
  const hours = config?.hours || 'Monday – Sunday: 24/7 Continuous Service';

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', orderNumber: '', subject: 'General Inquiry', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-14 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-bold tracking-[0.25em] text-[#704214] uppercase">
          {tagline}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1E16]">
          {headerTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6E65]">
          {headerSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#2B1E16]">
              Contact Details
            </h3>

            <div className="flex items-start gap-4 text-xs">
              <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#2B1E16] block">24/7 Telephone Concierge</span>
                <span className="text-[#7A6E65] block mt-0.5">{phone}</span>
                <span className="text-[10px] text-[#704214]">Toll-Free Worldwide</span>
              </div>
            </div>

            <div className="flex items-start gap-4 text-xs">
              <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#2B1E16] block">Client Support Email</span>
                <span className="text-[#7A6E65] block mt-0.5">{email}</span>
                <span className="text-[10px] text-[#704214]">Typical response within 2 hours</span>
              </div>
            </div>

            <div className="flex items-start gap-4 text-xs">
              <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#2B1E16] block">Flagship Global Office</span>
                <span className="text-[#7A6E65] block mt-0.5">{address}</span>
              </div>
            </div>

            <div className="flex items-start gap-4 text-xs">
              <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#704214] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#2B1E16] block">Boutique Operating Hours</span>
                <span className="text-[#7A6E65] block mt-0.5">{hours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-10 rounded-3xl bg-[#FFFDF9] border border-[#F0E7DB] shadow-luxury">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EBF5EC] text-[#2E7D32] flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2B1E16]">
                  Message Dispatched
                </h3>
                <p className="text-xs sm:text-sm text-[#605248] max-w-sm mx-auto">
                  Thank you for contacting Annsha Global. Your client advisor will review your message and reply promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="font-serif text-xl font-bold text-[#2B1E16] mb-2">
                  Send an Inquiry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-[#605248]">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Lady / Lord Sterling"
                      className="w-full px-4 py-2.5 bg-[#FAF5EE] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#704214]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-[#605248]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@domain.com"
                      className="w-full px-4 py-2.5 bg-[#FAF5EE] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#704214]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-[#605248]">Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#FAF5EE] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#704214]"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Tracking">Order & Delivery Status</option>
                      <option value="Return Request">Returns & Refunds</option>
                      <option value="Product Authenticity">Product & Craftsmanship Question</option>
                      <option value="VIP Bespoke">VIP Bespoke Concierge</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-[#605248]">Order Number (Optional)</label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="e.g. AG-2026-10481"
                      className="w-full px-4 py-2.5 bg-[#FAF5EE] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#704214]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-[#605248]">Message</label>
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How may our advisors be of service to you today?"
                    className="w-full px-4 py-2.5 bg-[#FAF5EE] border border-[#EADBCC] rounded-xl focus:outline-none focus:border-[#704214]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-semibold tracking-wide shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry to Concierge</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

