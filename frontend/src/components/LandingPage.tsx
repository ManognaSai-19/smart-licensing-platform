import React, { useState } from 'react';
import {
  Search,
  Mic,
  Sparkles,
  FileCheck,
  Clock,
  ArrowRight,
  Shield,
  CheckCircle2,
  Sliders,
  ChevronRight,
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onExploreServices: () => void;
  onOpenAccessibility: () => void;
  language: 'en' | 'te';
  onLanguageChange: (lang: 'en' | 'te') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onRegisterClick,
  onExploreServices,
  onOpenAccessibility,
  language,
  onLanguageChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchSuggestions = [
    { label: language === 'te' ? 'డ్రైవింగ్ లైసెన్స్' : 'Driving License Renewal', query: 'Driving' },
    { label: language === 'te' ? 'ట్రేడ్ లైసెన్స్' : 'Trade License Permit', query: 'Trade' },
    { label: language === 'te' ? 'భవన నిర్మాణ అనుమతి' : 'Building Permit', query: 'Building' },
    { label: language === 'te' ? 'నివాస ధృవీకరణ' : 'Residence Certificate', query: 'Residence' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExploreServices();
  };

  const handleSuggestionClick = (_query: string) => {
    onExploreServices();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#EAF2FF] selection:text-[#2563EB]">
      {/* 1. TOP OFFICIAL STATE BANNER */}
      <div className="w-full bg-[#101828] text-slate-300 px-4 sm:px-8 py-2 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium tracking-tight text-[11px] sm:text-xs">
            {language === 'te'
              ? 'తెలంగాణ & ఆంధ్రప్రదేశ్ ప్రభుత్వ అధికారిక డిజిటల్ లైసెన్సింగ్ పోర్టల్'
              : 'Government Public Digital Licensing & Authorisation Portal'}
          </span>
        </div>

        {/* Bilingual Language Switcher & Accessibility Shortcut */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAccessibility}
            className="hidden sm:inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition text-xs font-medium"
            title="Accessibility Preferences"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Accessibility</span>
          </button>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 rounded transition ${
                language === 'en' ? 'bg-[#2563EB] text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('te')}
              className={`px-2 py-0.5 rounded transition ${
                language === 'te' ? 'bg-[#2563EB] text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-8">
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#101828] text-white flex items-center justify-center font-black shadow-md border border-slate-800 group-hover:bg-[#2563EB] transition-colors">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#0F172A] block leading-none">
                  Smart Digital Licensing
                </span>
                <span className="text-[11px] font-semibold text-[#64748B] tracking-wide mt-1 block">
                  Unified State Platform
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-[#64748B]">
              <a
                href="#home"
                className="px-3.5 py-2 rounded-xl text-[#0F172A] hover:bg-slate-100 transition"
              >
                Home
              </a>
              <button
                type="button"
                onClick={onExploreServices}
                className="px-3.5 py-2 rounded-xl hover:text-[#0F172A] hover:bg-slate-100 transition"
              >
                Services
              </button>
              <a
                href="#how-it-works"
                className="px-3.5 py-2 rounded-xl hover:text-[#0F172A] hover:bg-slate-100 transition"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="px-3.5 py-2 rounded-xl hover:text-[#0F172A] hover:bg-slate-100 transition"
              >
                Features
              </a>
              <a
                href="#help"
                className="px-3.5 py-2 rounded-xl hover:text-[#0F172A] hover:bg-slate-100 transition"
              >
                Help & Guidelines
              </a>
            </nav>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onLoginClick}
              className="px-4 py-2 text-xs font-bold text-[#0F172A] hover:text-[#2563EB] hover:bg-slate-100 rounded-xl transition"
            >
              {language === 'te' ? 'లాగిన్' : 'Login'}
            </button>

            <button
              type="button"
              onClick={onRegisterClick}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-98 flex items-center gap-1.5"
            >
              <span>{language === 'te' ? 'ప్రారంభించండి' : 'Get Started'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (SPLIT LAYOUT ON DESKTOP, STACKED ON MOBILE) */}
      <section id="home" className="relative pt-10 pb-16 sm:py-20 lg:py-24 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-[#EAF2FF]/50 via-[#F8FAFC] to-[#F8FAFC]">
        {/* Subtle decorative background blur orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Copy, CTAs, Search */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2FF] border border-[#2563EB]/20 text-[#2563EB] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Smart Citizen Licensing</span>
            </div>

            {/* Exact Required Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#101828] tracking-tight leading-[1.12]">
              {language === 'te' ? (
                <>
                  మీ లైసెన్సులు. <br />
                  <span className="text-[#2563EB]">సులభం, వేగవంతం,</span> మీ వాయిస్‌తో.
                </>
              ) : (
                <>
                  Your licenses. <br />
                  <span className="text-[#2563EB]">Simpler, faster,</span> with your voice.
                </>
              )}
            </h1>

            {/* Exact Required Supporting Text */}
            <p className="text-sm sm:text-lg text-[#64748B] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {language === 'te'
                ? 'వాయిస్ గైడెన్స్, ఇంటెలిజెంట్ డాక్యుమెంట్ చెక్స్ మరియు పారదర్శకమైన అప్లికేషన్ ట్రాకింగ్‌తో సేవల కోసం దరఖాస్తు చేసుకోండి—అన్నీ ఒకే వేదికపై.'
                : 'Apply for services with voice guidance, intelligent document checks, and transparent application tracking—all in one place.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={onRegisterClick}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>{language === 'te' ? 'ఇప్పుడే ప్రారంభించండి' : 'Get Started Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onExploreServices}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-[#0F172A] font-bold text-sm rounded-2xl shadow-xs hover:border-[#2563EB] transition-all flex items-center justify-center gap-2"
              >
                <span>{language === 'te' ? 'సేవలను అన్వేషించండి' : 'Explore 50+ Services'}</span>
              </button>
            </div>

            {/* Quick Search Widget */}
            <div className="pt-2 max-w-xl mx-auto lg:mx-0">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative flex items-center bg-white rounded-2xl border border-slate-200/90 shadow-sm focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:border-[#2563EB] transition-all">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={language === 'te' ? 'సేవ కోసం శోధించండి (ఉదా: డ్రైవింగ్, ట్రేడ్)...' : 'Search licenses & permits (e.g., Driving, Trade, Building)...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-28 py-3.5 bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 font-medium focus:outline-none rounded-2xl"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-2 bg-[#101828] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Suggestions */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-[#64748B] mt-2.5">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Popular:</span>
                {searchSuggestions.map((item) => (
                  <button
                    key={item.query}
                    type="button"
                    onClick={() => handleSuggestionClick(item.query)}
                    className="text-[#2563EB] hover:underline font-semibold text-xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Badges Strip */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-3 text-left">
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#101828]">100%</div>
                <div className="text-[11px] text-[#64748B] font-medium">Digital Workflow</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#2563EB]">AI</div>
                <div className="text-[11px] text-[#64748B] font-medium">Pre-Screening</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#15803D]">Real-Time</div>
                <div className="text-[11px] text-[#64748B] font-medium">SLA Tracking</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Journey & Voice Assistant Showcase */}
          <div className="lg:col-span-5 relative">
            {/* Main Showcase Container */}
            <div className="relative bg-gradient-to-br from-[#101828] via-[#162544] to-[#1E3A8A] rounded-3xl p-6 sm:p-7 text-white shadow-2xl border border-slate-700/50 space-y-5">
              {/* Card Header: Device status & Official Portal Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold">
                    🏛️
                  </div>
                  <div>
                    <span className="font-extrabold block text-xs">Licensing Assistant</span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live & Listening
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2563EB]/40 border border-[#2563EB] text-[#EAF2FF]">
                  Bilingual Voice AI
                </span>
              </div>

              {/* Voice Interactive Simulation */}
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-md animate-bounce-subtle">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                      Voice Guidance Prompt
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
                      {language === 'te'
                        ? '"దయచేసి మీ ఆధార్ కార్డ్ లేదా ప్రస్తుత లైసెన్స్ సంఖ్యను చెప్పండి..."'
                        : '"Please speak your Aadhaar or Driving License number to auto-fill..."'}
                    </p>
                  </div>
                </div>

                {/* Animated Soundwave Visualizer Bars */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <span className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
                  <span className="w-1 h-6 bg-blue-300 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-4 bg-blue-500 rounded-full animate-pulse delay-150" />
                  <span className="w-1 h-7 bg-blue-200 rounded-full animate-pulse delay-100" />
                  <span className="w-1 h-5 bg-blue-400 rounded-full animate-pulse delay-200" />
                  <span className="w-1 h-3 bg-blue-300 rounded-full animate-pulse delay-75" />
                </div>
              </div>

              {/* Journey Step Preview Card */}
              <div className="bg-white rounded-2xl p-4 text-[#0F172A] shadow-md border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#2563EB]">
                      DRL-2026-001
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#15803D]/10 text-[#15803D]">
                      <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                      <span>OCR VERIFIED</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Day 2 of 7</span>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-[#0F172A]">
                    Driving License Renewal
                  </h4>
                  <p className="text-[11px] text-[#64748B]">Transport Department &bull; Hyderabad</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                    <span>Adjudication Progress</span>
                    <span className="text-[#2563EB] font-bold">75%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563EB] rounded-full w-3/4 transition-all" />
                  </div>
                </div>
              </div>

              {/* Floating Fast-Track Pill */}
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">Guaranteed SLA: 7 Days</span>
                </div>
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-blue-300 hover:text-white font-bold text-xs flex items-center gap-1"
                >
                  <span>Track Status</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE FEATURE HIGHLIGHTS */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EAF2FF] px-3 py-1 rounded-full border border-[#2563EB]/20">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              Engineered for Simplicity & Speed
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Every step of the government licensing lifecycle has been refined to eliminate bureaucratic delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1: Voice Assistance */}
            <div className="p-7 rounded-3xl bg-[#F8FAFC] border border-slate-200 hover:border-[#2563EB] hover:shadow-lg transition-all group space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-[#101828]">
                Voice Assistance
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Apply naturally in Telugu or English. Our conversational speech assistant reads questions aloud and transcribes your answers directly into forms.
              </p>
              <div className="pt-2 text-xs font-bold text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Supports Telugu & English</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2: Smart Document Checks */}
            <div className="p-7 rounded-3xl bg-[#F8FAFC] border border-slate-200 hover:border-[#2563EB] hover:shadow-lg transition-all group space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-[#101828]">
                Smart Document Checks
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Automated OCR compares uploaded certificates and IDs against your entered form fields to catch discrepancies and typos before submission.
              </p>
              <div className="pt-2 text-xs font-bold text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Pre-flight typo prevention</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3: Real-Time Tracking */}
            <div className="p-7 rounded-3xl bg-[#F8FAFC] border border-slate-200 hover:border-[#2563EB] hover:shadow-lg transition-all group space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-[#101828]">
                Real-Time Tracking
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                View chronological timelines for every application, read specific officer adjudication feedback, and download tamper-proof official digital certificates.
              </p>
              <div className="pt-2 text-xs font-bold text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Instant milestone alerts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION (THE APPLICATION JOURNEY) */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-[#EAF2FF] px-3 py-1 rounded-full border border-[#2563EB]/20">
              The Journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              How the Digital Platform Works
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              From choosing your license to downloading your verified certificate in 4 transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#101828] text-white font-black text-sm flex items-center justify-center shadow-xs">
                1
              </div>
              <h4 className="text-base font-bold text-[#101828]">Select Service</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Explore our catalog of transport and municipal licensing services with clear fees and processing timelines.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white font-black text-sm flex items-center justify-center shadow-xs">
                2
              </div>
              <h4 className="text-base font-bold text-[#101828]">Voice or Form Entry</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Provide applicant details using interactive voice dictation or the step-by-step digital wizard.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#101828] text-white font-black text-sm flex items-center justify-center shadow-xs">
                3
              </div>
              <h4 className="text-base font-bold text-[#101828]">Smart OCR Check</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Upload your document proofs and let automated pre-screening cross-check your data before submitting.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-[#15803D] text-white font-black text-sm flex items-center justify-center shadow-xs">
                4
              </div>
              <h4 className="text-base font-bold text-[#101828]">Digital Certificate</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Once reviewed by the officer, your official digital certificate is issued instantly with tamper-proof security.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onRegisterClick}
              className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Start Your First Application →
            </button>
          </div>
        </div>
      </section>

      {/* 6. CLEAN FOOTER */}
      <footer id="help" className="bg-[#101828] text-white pt-12 pb-8 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Brand Column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-sm tracking-tight">Smart Licensing</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Official unified licensing and regulatory authorisations portal for public citizens and businesses.
              </p>
            </div>

            {/* Services Links */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Popular Services</h5>
              <ul className="space-y-1.5 text-slate-400">
                <li><button type="button" onClick={onExploreServices} className="hover:text-white transition">Driving License Renewal</button></li>
                <li><button type="button" onClick={onExploreServices} className="hover:text-white transition">Trade & Commercial Permit</button></li>
                <li><button type="button" onClick={onExploreServices} className="hover:text-white transition">Building Permission</button></li>
                <li><button type="button" onClick={onExploreServices} className="hover:text-white transition">Residence Certificates</button></li>
              </ul>
            </div>

            {/* Accessibility & Help */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Accessibility & Support</h5>
              <ul className="space-y-1.5 text-slate-400">
                <li><button type="button" onClick={onOpenAccessibility} className="hover:text-white transition">Language & Voice Settings</button></li>
                <li><button type="button" onClick={onOpenAccessibility} className="hover:text-white transition">Screen Reader Optimisation</button></li>
                <li><a href="#how-it-works" className="hover:text-white transition">Step-by-Step Guide</a></li>
                <li><a href="#help" className="hover:text-white transition">Citizen Grievance Redressal</a></li>
              </ul>
            </div>

            {/* Contact & Security */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Helpdesk & Security</h5>
              <p className="text-slate-400 text-xs">
                Toll Free: <span className="text-white font-bold">1800-425-0001</span> (Mon-Sat, 9AM-6PM)
              </p>
              <p className="text-slate-400 text-xs">
                Email: <span className="text-white font-mono">support@licensing.gov.in</span>
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>256-bit SSL Encrypted & Secure</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Government Public Digital Services. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button type="button" onClick={onOpenAccessibility} className="hover:text-slate-300 transition">Accessibility Statement</button>
              <span>&bull;</span>
              <button type="button" onClick={onLoginClick} className="hover:text-slate-300 transition">Officer Portal</button>
              <span>&bull;</span>
              <button type="button" onClick={onLoginClick} className="hover:text-slate-300 transition">Administrator Portal</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
