import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Award,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const brandLogo = '/images/logo.webp';

export default function AuthPage({ mode: initialMode = 'login', onNavigate }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  // Sync mode with prop
  useEffect(() => {
    setMode(initialMode === 'signup' || initialMode === 'register' ? 'signup' : 'login');
    setError('');
    setSuccessMsg('');
  }, [initialMode]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    const targetPath = newMode === 'login' ? '/login' : '/signup';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    if (onNavigate) onNavigate(targetPath);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Sign Up Validations
    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your confirm password.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccessMsg('Welcome back! Redirecting to boutique...');
      } else {
        await register({ name, email, password, phone });
        setSuccessMsg('Account created successfully! Welcome to Annsha Global...');
      }

      setTimeout(() => {
        if (onNavigate) {
          onNavigate('/');
        } else {
          window.location.href = '/';
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMatch = confirmPassword && password === confirmPassword;
  const isPasswordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex flex-col justify-between selection:bg-[#704214] selection:text-white">
      {/* Top Floating Navigation Bar */}
      <header className="w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between z-20">
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('/') : (window.location.href = '/')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#704214] hover:text-[#2B1E16] bg-white/80 hover:bg-white px-3.5 py-2 rounded-full border border-[#EADBCC] shadow-xs backdrop-blur-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Boutique</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs text-[#7A6E65]">
            {mode === 'login' ? 'New to Annsha Gifts?' : 'Already have an account?'}
          </span>
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs sm:text-sm font-bold text-[#704214] hover:underline px-3 py-1.5 rounded-full hover:bg-[#F5EBE1] transition-colors"
          >
            {mode === 'login' ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Main Dual-Column Authentication Canvas */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-[#EADBCC] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          
          {/* Left Column: Brand Showcase & Value Propositions (Hidden on mobile, visible on desktop) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#2B1E16] via-[#3E2A1E] to-[#1C130D] text-white p-8 xl:p-10 flex-col justify-between relative overflow-hidden">
            {/* Subtle luxury ambient glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#C59B27]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#704214]/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

            {/* Top Brand Emblem */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-[#F5EBE1] mb-6 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Luxury Certified Member Portal</span>
              </div>
              <h1 className="font-serif text-2xl xl:text-3xl font-bold tracking-tight text-white leading-snug">
                Artisanal Living &amp; Timeless Luxury Gifts
              </h1>
              <p className="text-xs xl:text-sm text-[#D7C9BD] mt-2.5 leading-relaxed">
                Join our private client circle for bespoke curation, priority international dispatch, and exclusive verified patron privileges.
              </p>
            </div>

            {/* Center Value Props */}
            <div className="space-y-4 my-8 relative z-10">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-xl bg-[#704214] flex items-center justify-center shrink-0 text-[#FAF5EE]">
                  <Award className="w-4 h-4 text-[#C59B27]" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">100% Certified Luxury Quality</h2>
                  <p className="text-[11px] text-[#C4B5A5] mt-0.5">Authenticity guaranteed with boutique luxury gift packaging.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-xl bg-[#704214] flex items-center justify-center shrink-0 text-[#FAF5EE]">
                  <Truck className="w-4 h-4 text-[#C59B27]" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Worldwide Priority Dispatch</h2>
                  <p className="text-[11px] text-[#C4B5A5] mt-0.5">Tracked air courier across India, Australia, US &amp; 45+ nations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-xl bg-[#704214] flex items-center justify-center shrink-0 text-[#FAF5EE]">
                  <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Verified Customer Reviews</h2>
                  <p className="text-[11px] text-[#C4B5A5] mt-0.5">Submit reviews, track orders, and save your boutique wishlist.</p>
                </div>
              </div>
            </div>

            {/* Bottom Testimonial Snippet */}
            <div className="pt-4 border-t border-white/10 relative z-10">
              <div className="flex items-center gap-1 text-[#C59B27] mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C59B27]" />
                ))}
              </div>
              <p className="text-[11px] italic text-[#E2D6CB]">
                "The attention to detail and personal concierge is unmatched in modern retail."
              </p>
              <p className="text-[10px] text-[#A8988B] mt-1 font-medium">
                — Sophia Laurent, Verified Patron
              </p>
            </div>
          </div>

          {/* Right Column: Clean Interactive Auth Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto space-y-6">
              
              {/* Brand Header */}
              <div className="text-center sm:text-left">
                <div className="inline-block mb-3">
                  <img
                    src={brandLogo}
                    alt="Annsha Gifts"
                    className="h-10 sm:h-12 w-auto object-contain mx-auto sm:mx-0"
                  />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16] tracking-tight">
                  {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h2>
                <p className="text-xs sm:text-sm text-[#7A6E65] mt-1">
                  {mode === 'login' 
                    ? 'Enter your credentials to access your orders, reviews, and wishlist.' 
                    : 'Join Annsha Gifts for welcome discounts and priority privileges.'}
                </p>
              </div>

              {/* Mode Switcher Pills */}
              <div className="grid grid-cols-2 p-1 bg-[#FAF5EE] rounded-2xl border border-[#EADBCC]">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white text-[#704214] shadow-xs'
                      : 'text-[#7A6E65] hover:text-[#2B1E16]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-[#704214] shadow-xs'
                      : 'text-[#7A6E65] hover:text-[#2B1E16]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Alerts */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-[#FDF0EE] border border-[#F5C2BA] text-[#B93822] text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-[#EFFDF2] border border-[#B7ECC3] text-[#007017] text-xs flex items-start gap-2.5 animate-fadeIn font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Full Name (Sign Up only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="text-[11px] font-bold text-[#605248] uppercase tracking-wide block mb-1.5">
                      Full Name <span className="text-[#B93822]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-[#A4978C] absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:ring-2 focus:ring-[#704214]/15 focus:outline-none transition-all text-[#2B1E16]"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="text-[11px] font-bold text-[#605248] uppercase tracking-wide block mb-1.5">
                    Email Address <span className="text-[#B93822]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#A4978C] absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:ring-2 focus:ring-[#704214]/15 focus:outline-none transition-all text-[#2B1E16]"
                    />
                  </div>
                </div>

                {/* Phone (Optional, Sign Up only) */}
                {mode === 'signup' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[#605248] uppercase tracking-wide">
                        Phone Number
                      </label>
                      <span className="text-[10px] text-[#A4978C]">Optional for order SMS updates</span>
                    </div>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-[#A4978C] absolute left-3.5 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210 or +1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:ring-2 focus:ring-[#704214]/15 focus:outline-none transition-all text-[#2B1E16]"
                      />
                    </div>
                  </div>
                )}

                {/* Password with Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-[#605248] uppercase tracking-wide">
                      Password <span className="text-[#B93822]">*</span>
                    </label>
                    {mode === 'login' && (
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('For password resets, please contact concierge@annshaglobal.com or enter your email to receive recovery instructions.');
                        }}
                        className="text-[11px] font-semibold text-[#704214] hover:underline"
                      >
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#A4978C] absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Create a secure password (min 6 chars)' : 'Enter your password'}
                      className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:ring-2 focus:ring-[#704214]/15 focus:outline-none transition-all text-[#2B1E16]"
                    />
                    {/* Password Visibility Eye Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 rounded-md text-[#A4978C] hover:text-[#704214] hover:bg-[#FAF5EE] transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p className="text-[10px] text-[#7A6E65] mt-1 pl-1">
                      Must contain at least 6 characters.
                    </p>
                  )}
                </div>

                {/* Confirm Password with Eye Toggle & Real-time Validation (Task 2) */}
                {mode === 'signup' && (
                  <div>
                    <label className="text-[11px] font-bold text-[#605248] uppercase tracking-wide block mb-1.5">
                      Confirm Password <span className="text-[#B93822]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-[#A4978C] absolute left-3.5 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className={`w-full pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-[#FFFDF9] border transition-all text-[#2B1E16] focus:outline-none ${
                          isPasswordMatch 
                            ? 'border-[#007017] focus:ring-2 focus:ring-[#007017]/15' 
                            : isPasswordMismatch 
                            ? 'border-[#B93822] focus:ring-2 focus:ring-[#B93822]/15' 
                            : 'border-[#EADBCC] focus:border-[#704214] focus:ring-2 focus:ring-[#704214]/15'
                        }`}
                      />
                      {/* Confirm Password Visibility Eye Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 p-1 rounded-md text-[#A4978C] hover:text-[#704214] hover:bg-[#FAF5EE] transition-colors"
                        title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Real-time Match Feedback */}
                    {isPasswordMatch && (
                      <p className="text-[11px] text-[#007017] font-semibold mt-1 flex items-center gap-1 pl-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Passwords match perfectly</span>
                      </p>
                    )}
                    {isPasswordMismatch && (
                      <p className="text-[11px] text-[#B93822] font-semibold mt-1 flex items-center gap-1 pl-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Passwords do not match yet</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 sm:py-4 bg-[#704214] hover:bg-[#59330E] text-white rounded-2xl text-xs sm:text-sm font-bold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <span>{mode === 'login' ? 'Sign In to Your Account' : 'Create My Customer Account'}</span>
                  )}
                </button>
              </form>

              {/* Bottom Switcher Footer */}
              <div className="pt-4 border-t border-[#F0E7DB] text-center">
                {mode === 'login' ? (
                  <p className="text-xs text-[#7A6E65]">
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="font-bold text-[#704214] hover:underline ml-1"
                    >
                      Create one here →
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-[#7A6E65]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#704214] hover:underline ml-1"
                    >
                      Sign in here →
                    </button>
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer Copyright */}
      <footer className="w-full px-4 py-4 text-center text-xs text-[#A4978C] border-t border-[#EADBCC]/60 bg-white/40">
        <p>© 2026 Annsha Global Luxury Retailers Pvt Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
