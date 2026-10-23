import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User as UserIcon, Phone, AlertCircle, Shield, ArrowRight, Eye, EyeOff, X } from 'lucide-react';

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

    if (mode === 'register' && !agreeTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password, fullName, phoneNumber });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
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
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-center items-center p-4 overflow-y-auto animate-in fade-in">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative my-auto">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* App Top Branding */}
        <div className="bg-gradient-to-br from-[#101828] via-[#162544] to-[#2563EB] text-white p-6 sm:p-7 text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-2.5 shadow-inner">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Smart Digital Licensing</h1>
          <p className="text-xs text-[#EAF2FF] mt-1 font-medium">
            {mode === 'login' ? 'Sign in to continue to your account' : 'Join to access digital licensing services'}
          </p>
        </div>

        {/* Tab Toggle: Sign In / Register */}
        <div className="flex border-b border-slate-200 bg-[#F8FAFC] text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'login'
                ? 'bg-white text-[#2563EB] border-b-2 border-[#2563EB] shadow-xs'
                : 'text-slate-500 hover:text-[#101828]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'register'
                ? 'bg-white text-[#2563EB] border-b-2 border-[#2563EB] shadow-xs'
                : 'text-slate-500 hover:text-[#101828]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 bg-white">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#101828] focus:ring-2 focus:ring-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Mobile Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#101828] focus:ring-2 focus:ring-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#101828] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#101828] focus:ring-2 focus:ring-[#2563EB] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#101828]">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('For testing, please use one of the 1-Tap Demo buttons below or contact your administrator.')}
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#101828] focus:ring-2 focus:ring-[#2563EB] focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'register' && (
              <span className="text-[10px] text-slate-500 mt-1 block">
                Must be at least 8 characters (e.g. Password@123)
              </span>
            )}
          </div>

          {mode === 'login' ? (
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#2563EB] rounded focus:ring-[#2563EB]"
                />
                <span className="text-[11px] font-medium text-slate-600">Remember me</span>
              </label>
            </div>
          ) : (
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-3.5 h-3.5 mt-0.5 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-600 cursor-pointer">
                I agree to the <span className="text-[#2563EB] font-semibold underline">Terms of Service</span> and{' '}
                <span className="text-[#2563EB] font-semibold underline">Privacy Policy</span>.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Portal' : 'Create Citizen Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Quick 1-Tap Demo Roles */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
              1-Tap Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('citizen')}
                disabled={submitting}
                className="p-2 bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:text-[#2563EB] border border-slate-200 rounded-xl text-[11px] font-semibold text-[#101828] transition text-center"
              >
                👤 Citizen Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('transport')}
                disabled={submitting}
                className="p-2 bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:text-[#2563EB] border border-slate-200 rounded-xl text-[11px] font-semibold text-[#101828] transition text-center"
              >
                🚗 Transport Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('municipal')}
                disabled={submitting}
                className="p-2 bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:text-[#2563EB] border border-slate-200 rounded-xl text-[11px] font-semibold text-[#101828] transition text-center"
              >
                🏢 Municipal Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={submitting}
                className="p-2 bg-[#F8FAFC] hover:bg-[#EAF2FF] hover:text-[#2563EB] border border-slate-200 rounded-xl text-[11px] font-semibold text-[#101828] transition text-center"
              >
                ⚡ Platform Admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
