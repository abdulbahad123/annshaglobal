import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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

  const handleDemoAdminLogin = async () => {
    setEmail('admin@annshaglobal.com');
    setPassword('adminPassword123!');
    setLoading(true);
    try {
      await login('admin@annshaglobal.com', 'adminPassword123!');
      onClose();
    } catch (err) {
      setError(err.message);
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
        {/* Header */}
        <div className="p-5 border-b border-[#F0E7DB] flex items-center justify-between bg-[#FBF7F0]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#2B1E16]">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-[11px] text-[#7A6E65]">
              {mode === 'login' ? 'Sign in to access your luxury account.' : 'Join Annsha Global for exclusive rewards.'}
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
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FFFDF9] border border-[#EADBCC] focus:border-[#704214] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#704214] hover:bg-[#59330E] text-white rounded-full text-xs font-semibold tracking-wide shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Admin Login Pill */}
          <div className="pt-2 border-t border-[#F0E7DB] text-center">
            <button
              type="button"
              onClick={handleDemoAdminLogin}
              className="w-full py-2 bg-[#FAF3EC] hover:bg-[#F5EBE1] text-[#704214] rounded-full text-[11px] font-bold transition-all border border-[#EADBCC]"
            >
              🔑 Instant Demo Admin Sign In (1-Click)
            </button>
          </div>

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

