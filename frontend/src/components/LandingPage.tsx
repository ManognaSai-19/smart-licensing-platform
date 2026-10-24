import React, { useState } from 'react';
import {
  Mic,
  FileCheck,
  BarChart3,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  Globe,
  Sliders,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onExploreServices: () => void;
  onOpenAccessibility: () => void;
  language: 'en' | 'te';
  onLanguageChange: (lang: 'en' | 'te') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAccessibility,
  language,
  onLanguageChange,
}) => {
  const { login, register } = useAuth();

  // Mobile navigation state: 'hero' (Image 1 Left) or 'auth' (Image 1 Right)
  const [mobileView, setMobileView] = useState<'hero' | 'auth'>('hero');

  // Auth form state (used in Desktop right panel & Mobile auth view)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (authMode === 'login') {
        await login({ email, password });
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full legal name.');
          setSubmitting(false);
          return;
        }
        await register({ email, password, fullName, phoneNumber });
      }
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
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable Platform Brand Logo
  const BrandLogo = ({ size = 'normal' }: { size?: 'normal' | 'large' }) => (
    <div className="flex items-center gap-3">
      <div
        className={`${
          size === 'large' ? 'w-13 h-13 rounded-2xl' : 'w-11 h-11 rounded-2xl'
        } bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0 relative overflow-hidden`}
      >
        <div className="relative w-full h-full bg-[#2563EB] rounded-[14px] flex items-center justify-center">
          {/* Overlapping layered white cards */}
          <div className="absolute top-2 left-2 w-5 h-6 bg-white/40 rounded-[5px] rotate-[-6deg]" />
          <div className="absolute top-2.5 left-3 w-5 h-6 bg-white/70 rounded-[5px] rotate-[3deg]" />
          {/* Central checkmark badge */}
          <div className="relative w-5 h-5 rounded-full bg-[#1D4ED8] flex items-center justify-center shadow-xs">
            <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
          </div>
        </div>
      </div>
      <div>
        <span className="font-black text-[#0F172A] text-lg sm:text-xl tracking-tight leading-tight block">
          Smart
        </span>
        <span className="text-xs font-semibold text-[#64748B] tracking-tight leading-tight block -mt-0.5">
          Licensing Platform
        </span>
      </div>
    </div>
  );

  // Reusable Government Capitol Dome SVG Silhouette
  const CapitolDomeSilhouette = () => (
    <svg
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full text-[#2563EB] opacity-[0.07] pointer-events-none select-none"
    >
      <path
        d="M200 10V20M200 20C185 20 170 30 170 50H230C230 30 215 20 200 20ZM160 50H240V56H160V50ZM150 56H250V62H150V56ZM145 62L200 75L255 62H145ZM140 75H260V80H140V75ZM150 80V105M170 80V105M190 80V105M210 80V105M230 80V105M250 80V105ZM130 105H270V115H130V105ZM100 115H300V120H100V115ZM50 115H100V120H50V115ZM300 115H350V120H300V115Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#EAF2FF] selection:text-[#2563EB]">
      {/* =========================================================================
          DESKTOP & TABLET VIEW (Matches Image 2 - Split Screen Layout)
          ========================================================================= */}
      <div className="hidden lg:flex min-h-screen w-full">
        {/* LEFT COLUMN: HERO, VALUE PROPOSITIONS & ROBOT ILLUSTRATION (60% Width) */}
        <div className="w-[58%] xl:w-[60%] p-8 xl:p-14 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white via-[#F8FAFC] to-[#EFF6FF]/60 border-r border-slate-200/80">
          {/* Background Ambient Glow & Dome */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto opacity-80 pointer-events-none">
            <CapitolDomeSilhouette />
          </div>

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <BrandLogo />
            <button
              type="button"
              onClick={onOpenAccessibility}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-white text-xs font-semibold text-slate-600 hover:text-[#2563EB] shadow-xs transition"
            >
              <Sliders className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Accessibility</span>
            </button>
          </div>

          {/* Main Hero Copy */}
          <div className="relative z-10 my-auto py-6 max-w-xl">
            <h1 className="text-4xl xl:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.12]">
              Your licenses.{' '}
              <span className="text-[#2563EB] block mt-1">
                Simpler, faster, with your voice.
              </span>
            </h1>

            <p className="text-sm xl:text-base text-[#64748B] mt-4 leading-relaxed font-normal">
              {language === 'te'
                ? 'వాయిస్ మార్గదర్శకత్వం, సమర్థవంతమైన పత్రాల తనిఖీ మరియు పారదర్శక దరఖాస్తు ట్రాకింగ్‌తో ప్రభుత్వ సేవలను పొందండి.'
                : 'Apply for services with voice guidance, intelligent document checks, and transparent application tracking — all in one place.'}
            </p>

            {/* 3 Feature Highlight Bullets with Circular Badges */}
            <div className="mt-8 space-y-4">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Voice Assistance</h3>
                  <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                    Complete forms using speech or text.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Smart Document Checks</h3>
                  <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                    Understand missing fields and possible mismatches.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Transparent Tracking</h3>
                  <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                    Know your application's current status and next step.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Central Visual Showcase: Application Stepper + Friendly Robot with Speech Bubble */}
          <div className="relative z-10 mt-auto pt-4 flex items-end justify-between gap-6 max-w-xl">
            {/* Mock Application Card */}
            <div className="flex-1 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-lg shadow-blue-500/5">
              <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-bold text-slate-700 ml-2">New Application</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#2563EB] font-bold">
                  <div className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                  <span>Personal Details</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 pl-6 text-[11px]">
                  <span>Service Details</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 pl-6 text-[11px]">
                  <span>Upload Documents</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 pl-6 text-[11px]">
                  <span>Review & Submit</span>
                </div>
              </div>
            </div>

            {/* Cute Friendly Robot with Speech Bubble */}
            <div className="relative flex flex-col items-center shrink-0">
              {/* Speech Bubble */}
              <div className="relative -top-2 bg-white rounded-2xl px-3.5 py-2 shadow-md border border-slate-200/80 text-xs font-bold text-[#0F172A] whitespace-nowrap animate-bounce duration-1000">
                <span>Hi! How can I help you today?</span>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
              </div>

              {/* 3D-Styled Cute White Robot SVG */}
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                  {/* Antenna */}
                  <line x1="60" y1="20" x2="60" y2="35" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="60" cy="18" r="5" fill="#3B82F6" />
                  {/* Robot Head */}
                  <rect x="25" y="32" width="70" height="52" rx="26" fill="url(#robotGrad)" stroke="#CBD5E1" strokeWidth="1.5" />
                  {/* Ear pods */}
                  <rect x="18" y="46" width="8" height="24" rx="4" fill="#3B82F6" />
                  <rect x="94" y="46" width="8" height="24" rx="4" fill="#3B82F6" />
                  {/* Visor Screen */}
                  <rect x="33" y="40" width="54" height="36" rx="18" fill="#101828" />
                  {/* Glowing Smiling Eyes */}
                  <path d="M42 58C42 54 48 54 48 58" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                  <path d="M72 58C72 54 78 54 78 58" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                  {/* Robot Body Collar */}
                  <ellipse cx="60" cy="94" rx="22" ry="12" fill="#E2E8F0" />
                  <ellipse cx="60" cy="92" rx="20" ry="10" fill="#FFFFFF" />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="robotGrad" x1="25" y1="32" x2="95" y2="84" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFFFFF" />
                      <stop offset="1" stopColor="#E2E8F0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Floating Microphone Action Badge */}
                <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                  <Mic className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WELCOME BACK SIGN-IN PANEL (40% Width - Matches Image 2) */}
        <div className="w-[42%] xl:w-[40%] bg-white p-8 xl:p-14 flex flex-col justify-between overflow-y-auto">
          {/* Top Language Selector */}
          <div className="flex justify-end items-center">
            <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
              <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
              <button
                type="button"
                onClick={() => onLanguageChange(language === 'en' ? 'te' : 'en')}
                className="hover:text-[#2563EB] transition"
              >
                {language === 'en' ? 'English (EN)' : 'తెలుగు (TE)'}
              </button>
            </div>
          </div>

          {/* Centered Auth Card */}
          <div className="my-auto max-w-sm w-full mx-auto py-6">
            <div className="mb-6">
              <h2 className="text-2xl xl:text-3xl font-black text-[#0F172A] tracking-tight">
                {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-xs text-[#64748B] mt-1 font-medium">
                {authMode === 'login' ? 'Sign in to your account' : 'Register for digital license services'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#B91C1C]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link has been dispatched to your email.')}
                    className="text-[#2563EB] hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Primary Action Button: Sign In -> */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider OR */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="bg-white px-3">OR</span>
              </div>
            </div>

            {/* Toggle Mode: Create a new account */}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setAuthMode(authMode === 'login' ? 'register' : 'login');
              }}
              className="w-full py-2.5 bg-white border border-slate-200 hover:border-[#2563EB] text-[#2563EB] rounded-xl text-xs font-bold shadow-2xs transition"
            >
              {authMode === 'login' ? 'Create a new account' : 'Already have an account? Sign In'}
            </button>

            {/* 1-Click Quick Demo Sign-Ins for testing */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Quick 1-Click Demo Login
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('citizen')}
                  className="p-2 rounded-lg bg-[#EAF2FF] text-[#2563EB] hover:bg-blue-100 transition truncate"
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('transport')}
                  className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition truncate"
                >
                  Transport Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('municipal')}
                  className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition truncate"
                >
                  Municipal Officer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="p-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition truncate"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>

          {/* Legal Footer Note */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="#terms" className="underline hover:text-slate-600">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="underline hover:text-slate-600">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (Matches Image 1 - Screen 1 Left & Screen 1 Right)
          ========================================================================= */}
      <div className="lg:hidden flex-1 flex flex-col min-h-screen justify-between p-5 relative overflow-hidden bg-gradient-to-b from-[#EFF6FF]/60 via-white to-[#F8FAFC]">
        {/* MOBILE VIEW A: LANDING / ONBOARDING SCREEN (Matches Image 1 Left) */}
        {mobileView === 'hero' && (
          <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-300">
            {/* Header: Logo */}
            <div className="pt-2">
              <BrandLogo />
            </div>

            {/* Headline & Subtitle */}
            <div className="mt-6">
              <h1 className="text-3xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
                Your licenses.{' '}
                <span className="text-[#2563EB] block mt-0.5">
                  Simpler, faster, with your voice.
                </span>
              </h1>
              <p className="text-xs text-[#64748B] mt-2.5 leading-relaxed font-normal">
                Apply for services with voice guidance, intelligent document checks, and transparent application tracking —all in one place.
              </p>
            </div>

            {/* Central Graphic: Mock Smartphone + Cute Robot + Voice Wave */}
            <div className="relative my-6 flex items-center justify-center">
              {/* Background Dome Accent */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                <CapitolDomeSilhouette />
              </div>

              {/* Smartphone Frame Mockup */}
              <div className="relative w-44 h-56 bg-white rounded-3xl p-3 border-2 border-blue-100 shadow-xl shadow-blue-500/10 flex flex-col justify-between -rotate-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs text-[#2563EB]">
                    👤
                  </div>
                  <div className="space-y-1">
                    <div className="w-14 h-2 bg-slate-200 rounded-full" />
                    <div className="w-10 h-1.5 bg-slate-100 rounded-full" />
                  </div>
                </div>

                <div className="space-y-2 my-auto pl-1">
                  <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[8px]">✓</span>
                    <span>License Form</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[8px]">✓</span>
                    <span>Document OCR</span>
                  </div>
                </div>

                {/* Animated Soundwave pill */}
                <div className="bg-[#2563EB] text-white py-1.5 px-3 rounded-full flex items-center justify-center gap-1 shadow-sm">
                  <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                  <span className="w-1 h-5 bg-white rounded-full animate-pulse" />
                  <span className="w-1 h-2 bg-white rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-white rounded-full animate-pulse" />
                </div>
              </div>

              {/* Cute Robot Floating Right */}
              <div className="absolute -right-2 bottom-2 w-24 h-24 drop-shadow-lg">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <line x1="60" y1="20" x2="60" y2="35" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="60" cy="18" r="5" fill="#3B82F6" />
                  <rect x="25" y="32" width="70" height="52" rx="26" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                  <rect x="18" y="46" width="8" height="24" rx="4" fill="#3B82F6" />
                  <rect x="94" y="46" width="8" height="24" rx="4" fill="#3B82F6" />
                  <rect x="33" y="40" width="54" height="36" rx="18" fill="#101828" />
                  <path d="M42 58C42 54 48 54 48 58" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                  <path d="M72 58C72 54 78 54 78 58" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                </svg>

                {/* Circular Blue Mic Badge */}
                <div className="absolute -bottom-1 left-2 w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md">
                  <Mic className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 3 Value Proposition Bullets */}
            <div className="space-y-3.5 my-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A]">Voice Assistance</h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Complete forms using speech or text.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A]">Smart Document Checks</h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Understand missing fields and possible mismatches.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A]">Transparent Tracking</h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Know your application's current status and next step.</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Get Started -> & Carousel Dots */}
            <div className="pt-4 pb-2 space-y-3">
              <button
                type="button"
                onClick={() => setMobileView('auth')}
                className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Pagination Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
        )}

        {/* MOBILE VIEW B: SIGN IN / REGISTRATION SCREEN (Matches Image 1 Right) */}
        {mobileView === 'auth' && (
          <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-300">
            {/* Top Navigation: Back Button & Language switch */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setMobileView('hero')}
                className="p-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-5 h-5 text-slate-800" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange(language === 'en' ? 'te' : 'en')}
                className="text-xs font-bold text-[#2563EB] bg-[#EAF2FF] px-2.5 py-1 rounded-xl"
              >
                {language === 'en' ? 'EN' : 'తెలుగు'}
              </button>
            </div>

            {/* Centered Logo & Title */}
            <div className="flex flex-col items-center text-center my-auto py-2">
              <div className="mb-2">
                <BrandLogo size="large" />
              </div>

              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight mt-2">
                {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-xs text-[#64748B] mt-1 font-medium">
                {authMode === 'login' ? 'Sign in to your account' : 'Register for licensing services'}
              </p>

              {/* Form Container */}
              <div className="w-full bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md shadow-slate-100 mt-4 text-left">
                {error && (
                  <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#B91C1C]" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="Enter mobile number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Email address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {authMode === 'login' && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => alert('Password reset link sent.')}
                        className="text-[11px] text-[#2563EB] hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Primary Action Button: Sign In -> */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider OR */}
                <div className="relative my-3.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="bg-white px-2.5">OR</span>
                  </div>
                </div>

                {/* Secondary Button: Create a new account */}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                  }}
                  className="w-full py-2.5 bg-white border border-slate-200 hover:border-[#2563EB] text-[#2563EB] rounded-xl text-xs font-bold shadow-2xs transition"
                >
                  {authMode === 'login' ? 'Create a new account' : 'Already have an account? Sign In'}
                </button>
              </div>

              {/* 1-Click Quick Demo Sign-Ins */}
              <div className="w-full mt-3 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  1-Click Demo Login
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('citizen')}
                    className="p-2 rounded-lg bg-[#EAF2FF] text-[#2563EB] active:scale-95 transition"
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('transport')}
                    className="p-2 rounded-lg bg-slate-100 text-slate-700 active:scale-95 transition"
                  >
                    Transport Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('municipal')}
                    className="p-2 rounded-lg bg-slate-100 text-slate-700 active:scale-95 transition"
                  >
                    Municipal Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className="p-2 rounded-lg bg-purple-50 text-purple-700 active:scale-95 transition"
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Subtle Capitol Silhouette */}
            <div className="opacity-60 max-w-xs mx-auto pointer-events-none mt-2">
              <CapitolDomeSilhouette />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
