import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

export default function CheckoutModal({ isOpen, onClose }) {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine: '14 Rue de la Paix',
    city: user?.city || 'New York',
    state: 'NY',
    postalCode: '10001',
    country: user?.country || 'United States'
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const shippingFee = subtotal >= 50 ? 0 : 5.00;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const grandTotal = Number((subtotal + shippingFee + tax).toFixed(2));

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          product: item.product,
          title: item.title,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod
      };

      const res = await axiosClient.post('/orders/checkout', orderPayload);
      if (res.success && res.order) {
        setOrderSuccess(res.order);
        clearCart();
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#F0E7DB] z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#F0E7DB] flex items-center justify-between bg-[#FBF7F0]">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2B1E16]">
              {orderSuccess ? 'Order Confirmed!' : 'Secure Checkout'}
            </h2>
            <p className="text-[11px] text-[#7A6E65]">
              {orderSuccess ? 'Thank you for shopping with Annsha Global.' : 'Fast and encrypted 256-bit order completion.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A6E65] hover:bg-[#F5EBE1]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {orderSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EBF5EC] text-[#2E7D32] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2B1E16]">
                Order #{orderSuccess.orderNumber}
              </h3>
              <p className="text-xs sm:text-sm text-[#605248] max-w-sm mx-auto leading-relaxed">
                Your order has been securely processed and sent to fulfillment. You can track this order in your customer account or from the Admin Orders dashboard.
              </p>

              <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#EADBCC] text-xs text-left space-y-1.5 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#7A6E65]">Recipient:</span>
                  <span className="font-semibold text-[#2B1E16]">{orderSuccess.shippingAddress.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A6E65]">Payment:</span>
                  <span className="font-semibold text-[#704214] uppercase">{orderSuccess.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-t border-[#EADBCC] pt-1.5 font-bold text-sm">
                  <span>Grand Total:</span>
                  <span className="text-[#704214]">${Number(orderSuccess.grandTotal).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-md"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {error && (
                <div className="p-3 bg-[#FDF0EE] text-[#B93822] text-xs rounded-xl border border-[#F5C2BA]">
                  {error}
                </div>
              )}

              {/* Shipping Address Inputs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#2B1E16] uppercase tracking-wider">
                  1. Shipping Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#605248] block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#605248] block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      placeholder="+1 555 019 2831"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#605248] block mb-1">Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.addressLine}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                    placeholder="123 Luxury Ave, Apt 4B"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#605248] block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#605248] block mb-1">State / Prov</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#605248] block mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-[#2B1E16] uppercase tracking-wider">
                  2. Payment Method
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border text-center transition-all ${paymentMethod === 'cod' ? 'border-[#704214] bg-[#F7EFE4] font-bold' : 'border-[#EADBCC] bg-[#FFFDF9]'}`}
                  >
                    <span className="text-xs block text-[#2B1E16]">Cash On Delivery</span>
                    <span className="text-[10px] text-[#7A6E65]">Pay at door</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-3 rounded-2xl border text-center transition-all ${paymentMethod === 'stripe' ? 'border-[#704214] bg-[#F7EFE4] font-bold' : 'border-[#EADBCC] bg-[#FFFDF9]'}`}
                  >
                    <span className="text-xs block text-[#2B1E16]">Stripe Card</span>
                    <span className="text-[10px] text-[#7A6E65]">Visa / Master</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-3 rounded-2xl border text-center transition-all ${paymentMethod === 'paypal' ? 'border-[#704214] bg-[#F7EFE4] font-bold' : 'border-[#EADBCC] bg-[#FFFDF9]'}`}
                  >
                    <span className="text-xs block text-[#2B1E16]">PayPal</span>
                    <span className="text-[10px] text-[#7A6E65]">Instant</span>
                  </button>
                </div>
              </div>

              {/* Order Summary breakdown */}
              <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#EADBCC] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#605248]">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-[#2B1E16]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#605248]">
                  <span>Shipping:</span>
                  <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-[#605248]">
                  <span>Estimated Tax (5%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#2B1E16] border-t border-[#EADBCC] pt-2">
                  <span>Grand Total:</span>
                  <span className="text-[#704214]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
                <span>{loading ? 'Processing Order...' : `Place Order • $${grandTotal.toFixed(2)}`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

