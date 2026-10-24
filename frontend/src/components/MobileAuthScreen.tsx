import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  AlertCircle,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface MobileAuthScreenProps {
  initialMode?: 'login' | 'register';
  onClose?: () => void;
}

export const MobileAuthScreen: React.FC<MobileAuthScreenProps> = ({
  initialMode = 'login',
  onClose,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!agreeTerms) {
        setError('Please accept the Terms of Service & Privacy Guidelines.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (!fullName.trim()) {
        setError('Please enter your full legal name.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password, fullName, phoneNumber });
      }
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (type: 'citizen' | 'transport' | 'municipal' | 'admin') => {
    setError(null);
    setSubmitting(true);
    let demoEmail = '';
    let demoPass = '';

    if (type === 'citizen') {
      demoEmail = 'citizen.tester@licensing.gov.in';
      demoPass = 'Citizen@123';
    } else if (type === 'transport') {
      demoEmail = 'officer.transport@licensing.gov.in';
      demoPass = 'Officer@123';
    } else if (type === 'municipal') {
      demoEmail = 'officer.municipal@licensing.gov.in';
      demoPass = 'Officer@123';
    } else if (type === 'admin') {
      demoEmail = 'admin@licensing.gov.in';
      demoPass = 'Admin@123';
    }

    setEmail(demoEmail);
    setPassword(demoPass);

    try {
      await login({ email: demoEmail, password: demoPass });
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-heading"
    >
      {/* Split-screen Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row my-auto max-h-[95vh]">
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication dialog"
            className="absolute top-4 right-4 z-30 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* LEFT BRAND PANEL (Visible on MD and Desktop) */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#101828] via-[#162544] to-[#1E3A8A] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/10">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight block">
                  Smart Digital Licensing
                </span>
                <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold block">
                  Unified State Portal
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 id="auth-modal-heading" className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-[#EAF2FF]/80 leading-relaxed font-normal">
                {mode === 'login'
                  ? 'Access your digital applications, check real-time adjudication status, and download verified certificates.'
                  : 'Register in seconds to submit license applications with voice guidance and smart pre-screening.'}
              </p>
            </div>

            {/* Platform Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant voice-guided form completion</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Smart OCR document verification</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Guaranteed SLA transparent tracking</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-300" />
            <span>Official 256-bit GovTech Encrypted Access</span>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Tab Switcher */}
            <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-6 text-xs font-bold border border-slate-200">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white text-[#2563EB] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-white text-[#2563EB] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-[#B91C1C] flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Register Only) */}
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Full Legal Name <span className="text-[#B91C1C]">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sai Manogna"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Email Address <span className="text-[#B91C1C]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Phone Number (Register Only) */}
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Password <span className="text-[#B91C1C]">*</span>
                  </label>
                  {mode === 'register' && (
                    <span className="text-[10px] text-[#64748B]">Min 8 characters</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me / Terms Checkboxes */}
              <div className="pt-1 space-y-2 text-xs text-[#64748B]">
                {mode === 'login' ? (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB]"
                      />
                      <span>Remember this browser</span>
                    </label>
                  </div>
                ) : (
                  <label className="flex items-start gap-2 cursor-pointer font-medium select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB]"
                    />
                    <span className="leading-snug">
                      I agree to the official{' '}
                      <span className="text-[#2563EB] underline font-semibold">Terms of Service</span> and{' '}
                      <span className="text-[#2563EB] underline font-semibold">Privacy Policy</span>.
                    </span>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Portal' : 'Create Citizen Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="pt-6 mt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Instant Demo Login</span>
              </span>
              <span className="text-[10px] text-slate-400">1-click test access</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('citizen')}
                disabled={submitting}
                className="p-2 bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#2563EB] border border-slate-200 rounded-xl text-left transition group"
              >
                <span className="text-[11px] font-bold text-[#0F172A] block group-hover:text-[#2563EB]">
                  Citizen
                </span>
                <span className="text-[10px] text-slate-400 block truncate">Sai Manogna</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('transport')}
                disabled={submitting}
                className="p-2 bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#2563EB] border border-slate-200 rounded-xl text-left transition group"
              >
                <span className="text-[11px] font-bold text-[#0F172A] block group-hover:text-[#2563EB]">
                  Transport
                </span>
                <span className="text-[10px] text-slate-400 block truncate">RTO Reviewer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('municipal')}
                disabled={submitting}
                className="p-2 bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#2563EB] border border-slate-200 rounded-xl text-left transition group"
              >
                <span className="text-[11px] font-bold text-[#0F172A] block group-hover:text-[#2563EB]">
                  Municipal
                </span>
                <span className="text-[10px] text-slate-400 block truncate">Trade Officer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={submitting}
                className="p-2 bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:border-[#2563EB] border border-slate-200 rounded-xl text-left transition group"
              >
                <span className="text-[11px] font-bold text-[#0F172A] block group-hover:text-[#2563EB]">
                  Admin
                </span>
                <span className="text-[10px] text-slate-400 block truncate">System Overseer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
