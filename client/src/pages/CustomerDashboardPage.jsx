import React, { useState, useEffect } from 'react';
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Truck, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  ShoppingBag, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function CustomerDashboardPage({ navigate, onSelectProduct, onShopNow }) {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses'
  
  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || 'India'
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Fetch My Orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axiosClient.get('/orders/my-orders');
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      if (updateUser) {
        await updateUser(profileForm);
      }
      setProfileMsg('Profile information updated successfully!');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getTrackingStep = (status) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'processing') return 2;
    if (s === 'cancelled') return 0;
    return 1; // pending/placed
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center text-[#704214] mx-auto mb-4 shadow-xs">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-[#2B1E16]">Sign In to Your Account</h2>
        <p className="text-xs text-[#7A6E65] max-w-sm mt-1.5 mb-6">
          Access your personal orders, live package tracking, saved wishlist items, and delivery preferences.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-[#704214] text-white rounded-full text-xs font-bold hover:bg-[#59330E] transition-all shadow-sm"
          >
            Customer Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-2.5 bg-white border border-[#EADBCC] text-[#2B1E16] rounded-full text-xs font-bold hover:bg-[#FAF5EE] transition-all shadow-xs"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#2B1E16] py-6 sm:py-10 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#7A6E65]">
          <button onClick={() => navigate('/')} className="hover:text-[#704214] transition-colors">Home</button>
          <span>/</span>
          <span className="font-semibold text-[#2B1E16]">My Account</span>
        </div>

        {/* Customer Profile Banner */}
        <div className="bg-gradient-to-r from-[#3D2010] to-[#220D04] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-white to-transparent pointer-events-none"></div>
          
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100/10 border border-amber-200/20 flex items-center justify-center text-amber-300 font-serif text-2xl sm:text-3xl font-bold shadow-inner backdrop-blur-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
                    Welcome, {user?.name || 'Valued Customer'}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Sparkles className="w-2.5 h-2.5" /> VIP Member
                  </span>
                </div>
                <p className="text-xs text-amber-200/70 mt-1 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> {user?.email || 'customer@annshaglobal.com'}
                </p>
                {user?.phone && (
                  <p className="text-xs text-amber-200/70 mt-0.5 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> {user.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3 sm:gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-center min-w-[90px]">
                <p className="text-lg sm:text-xl font-bold text-amber-300 font-serif">{orders.length}</p>
                <p className="text-[10px] uppercase tracking-wider text-amber-100/60 font-semibold">Orders</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-center min-w-[90px]">
                <p className="text-lg sm:text-xl font-bold text-amber-300 font-serif">
                  ${orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0).toFixed(0)}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-amber-100/60 font-semibold">Spent</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-3 bg-white/10 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/30 text-amber-200 hover:text-rose-300 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Tab Navigation */}
          <div className="bg-white rounded-2xl border border-[#F0E7DB] p-3 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders' 
                  ? 'bg-[#704214] text-white shadow-xs' 
                  : 'text-[#2B1E16] hover:bg-[#FAF5EE]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-[#704214]'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'profile' 
                  ? 'bg-[#704214] text-white shadow-xs' 
                  : 'text-[#2B1E16] hover:bg-[#FAF5EE]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => navigate('/wishlist')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold text-[#2B1E16] hover:bg-[#FAF5EE] transition-all"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-[#704214]" />
                <span>My Wishlist</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7A6E65]" />
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all border-t border-[#F0E7DB] mt-2 pt-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Right Main Panel */}
          <div className="lg:col-span-3 space-y-6">

            {/* TAB 1: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-serif font-bold text-[#2B1E16] flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#704214]" />
                    <span>Order History &amp; Real-time Tracking</span>
                  </h2>
                  <button 
                    onClick={fetchOrders}
                    disabled={ordersLoading}
                    className="p-1.5 text-xs text-[#7A6E65] hover:text-[#704214] flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white border border-[#F0E7DB] rounded-2xl p-6 shadow-xs animate-pulse space-y-4">
                        <div className="h-5 bg-[#F0E7DB] rounded w-1/3"></div>
                        <div className="h-16 bg-[#FAF5EE] rounded-xl"></div>
                        <div className="h-4 bg-[#F0E7DB] rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-[#F0E7DB] rounded-2xl p-8 sm:p-12 text-center shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center text-[#704214] mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#2B1E16]">No Orders Placed Yet</h3>
                    <p className="text-xs text-[#7A6E65] max-w-md mx-auto mt-1 mb-6">
                      Explore our handpicked curation of luxury lifestyle pieces, jewelry, cosmetics, and seasonal gift sets.
                    </p>
                    <button
                      onClick={() => onShopNow ? onShopNow() : navigate('/shop')}
                      className="px-6 py-2.5 bg-[#704214] text-white rounded-full text-xs font-bold hover:bg-[#59330E] transition-all shadow-sm inline-flex items-center gap-2"
                    >
                      <span>Explore Luxury Collections</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const step = getTrackingStep(order.orderStatus);
                      return (
                        <div 
                          key={order._id || order.orderNumber}
                          className="bg-white border border-[#F0E7DB] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0E7DB]">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#2B1E16] font-mono">
                                  #{order.orderNumber || order._id}
                                </span>
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(order.orderStatus)}`}>
                                  {order.orderStatus || 'Pending'}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#7A6E65] mt-1 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-xs text-[#7A6E65]">Total Amount</p>
                              <p className="text-base sm:text-lg font-serif font-bold text-[#704214]">
                                ${Number(order.grandTotal || 0).toFixed(2)}
                              </p>
                              <p className="text-[10px] text-[#7A6E65] uppercase font-semibold">
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'} ({order.paymentStatus || 'Pending'})
                              </p>
                            </div>
                          </div>

                          {/* Tracking Progress Bar */}
                          {order.orderStatus !== 'cancelled' && (
                            <div className="py-4 border-b border-[#F0E7DB]">
                              <p className="text-[11px] font-semibold text-[#7A6E65] mb-3 flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-[#704214]" />
                                <span>Order Delivery Status</span>
                              </p>
                              <div className="grid grid-cols-4 gap-2 relative">
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#F0E7DB] -translate-y-1/2 z-0"></div>
                                <div 
                                  className="absolute top-1/2 left-0 h-1 bg-[#704214] -translate-y-1/2 z-0 transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(0, ((step - 1) / 3) * 100))}%` }}
                                ></div>

                                {[
                                  { s: 1, label: 'Order Placed' },
                                  { s: 2, label: 'Processing' },
                                  { s: 3, label: 'Shipped' },
                                  { s: 4, label: 'Delivered' }
                                ].map((item) => {
                                  const isDone = step >= item.s;
                                  return (
                                    <div key={item.s} className="relative z-10 flex flex-col items-center text-center">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-xs ${
                                        isDone ? 'bg-[#704214] text-white ring-2 ring-amber-100' : 'bg-white border-2 border-[#EADBCC] text-[#7A6E65]'
                                      }`}>
                                        {isDone ? '✓' : item.s}
                                      </div>
                                      <span className={`text-[10px] mt-1.5 font-medium ${isDone ? 'text-[#2B1E16] font-semibold' : 'text-[#7A6E65]'}`}>
                                        {item.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Items List */}
                          <div className="pt-3 space-y-2.5">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#FAF5EE]/50 hover:bg-[#FAF5EE] transition-colors">
                                <div className="flex items-center gap-3">
                                  {item.image ? (
                                    <img 
                                      src={item.image} 
                                      alt={item.title} 
                                      className="w-12 h-12 object-cover rounded-lg border border-[#EADBCC]" 
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center text-xs text-[#7A6E65]">
                                      Luxury
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-xs font-semibold text-[#2B1E16] line-clamp-1">{item.title}</p>
                                    <p className="text-[11px] text-[#7A6E65]">Qty: {item.quantity} × ${Number(item.price || 0).toFixed(2)}</p>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-[#704214]">
                                  ${Number(item.total || item.price * item.quantity || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Address Summary */}
                          {order.shippingAddress && (
                            <div className="mt-3 pt-3 border-t border-[#F0E7DB] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#7A6E65] gap-2">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#704214]" />
                                Deliver to: {order.shippingAddress.fullName || order.customerName}, {order.shippingAddress.addressLine || order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.pincode}
                              </span>
                              <span className="font-semibold text-[#704214]">
                                Standard Express Delivery
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PROFILE SETTINGS */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-[#F0E7DB] rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-serif font-bold text-[#2B1E16] mb-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#704214]" />
                  <span>Profile &amp; Delivery Information</span>
                </h2>
                <p className="text-xs text-[#7A6E65] mb-6">
                  Update your personal profile and primary delivery address for smooth checkout.
                </p>

                {profileMsg && (
                  <div className={`p-3.5 rounded-xl text-xs font-medium mb-6 ${
                    profileMsg.includes('success') 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2B1E16] mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EADBCC] text-xs focus:outline-none focus:border-[#704214] bg-[#FAF5EE]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2B1E16] mb-1.5">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={profileForm.email}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EADBCC] text-xs bg-slate-100 text-[#7A6E65] cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2B1E16] mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EADBCC] text-xs focus:outline-none focus:border-[#704214] bg-[#FAF5EE]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2B1E16] mb-1.5">City / Region</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        placeholder="Mumbai, New Delhi, London..."
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EADBCC] text-xs focus:outline-none focus:border-[#704214] bg-[#FAF5EE]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B1E16] mb-1.5">Primary Delivery Address</label>
                    <textarea
                      rows={3}
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Apartment, Street address, Landmark, Pincode"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EADBCC] text-xs focus:outline-none focus:border-[#704214] bg-[#FAF5EE]/30"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-6 py-2.5 bg-[#704214] text-white rounded-full text-xs font-bold hover:bg-[#59330E] transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                    >
                      {profileSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
