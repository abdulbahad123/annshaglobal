import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, phone });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
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
      <div className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#F0E7DB] z-10 overflow-hidden">
        {/* Header with Mode Toggle Tabs */}
        <div className="p-5 border-b border-[#F0E7DB] bg-[#FBF7F0]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2B1E16]">
                {mode === 'login' ? 'Customer Sign In' : 'Create an Account'}
              </h2>
              <p className="text-[11px] text-[#7A6E65]">
                {mode === 'login' ? 'Sign in to access orders, wishlist, and reviews.' : 'Join Annsha Gifts for exclusive customer rewards.'}
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

          {/* Clean Customer Auth Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#FAF5EE] rounded-xl border border-[#EADBCC]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' 
                  ? 'bg-white text-[#704214] shadow-xs' 
                  : 'text-[#7A6E65] hover:text-[#2B1E16]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'register' 
                  ? 'bg-white text-[#704214] shadow-xs' 
                  : 'text-[#7A6E65] hover:text-[#2B1E16]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FDF0EE] text-[#B93822] text-xs rounded-xl border border-[#F5C2BA]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-[#605248] block mb-1">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#A4978C] absolute left-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#605248] block mb-1">Phone (Optional)</label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-[#A4978C] absolute left-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-medium text-[#605248] block mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#A4978C] absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#605248] block mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#A4978C] absolute left-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#A4978C] hover:text-[#704214]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-[11px] font-medium text-[#605248] block mb-1">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#A4978C] absolute left-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-[#A4978C] hover:text-[#704214]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[10px] text-[#007017] font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Passwords match</span>
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-semibold tracking-wide shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2">
            {mode === 'login' ? (
              <p className="text-xs text-[#7A6E65]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="font-bold text-[#704214] hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#7A6E65]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="font-bold text-[#704214] hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

