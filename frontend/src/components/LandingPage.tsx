import React from 'react';
import {
  Shield,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  Sliders,
  FileCheck2,
  Clock,
  Mic,
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
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-[#101828] text-base tracking-tight block leading-none">
                Smart Digital Licensing
              </span>
              <span className="text-[11px] font-semibold text-slate-500 leading-none mt-1 block">
                Public Services Platform
              </span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#services" className="hover:text-[#2563EB] transition">
              Services
            </a>
            <a href="#how-it-works" className="hover:text-[#2563EB] transition">
              How It Works
            </a>
            <a href="#features" className="hover:text-[#2563EB] transition">
              Features
            </a>
            <a href="#help" className="hover:text-[#2563EB] transition">
              Help
            </a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-bold text-slate-700">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  language === 'en' ? 'bg-white text-[#2563EB] shadow-xs' : 'hover:text-[#101828]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('te')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  language === 'te' ? 'bg-white text-[#2563EB] shadow-xs' : 'hover:text-[#101828]'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Accessibility Settings Trigger */}
            <button
              type="button"
              onClick={onOpenAccessibility}
              title="Accessibility & Language Preferences"
              className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-slate-100 rounded-xl transition"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Auth Buttons */}
            <button
              type="button"
              onClick={onLoginClick}
              className="px-3.5 py-2 text-xs font-bold text-[#101828] hover:text-[#2563EB] hover:bg-slate-100 rounded-xl transition"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={onRegisterClick}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-slate-200 bg-gradient-to-b from-white to-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Heading and CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-xs font-bold border border-[#cfe0fc]">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Voice-First Digital Citizen Services</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#101828] leading-[1.1]">
                  Your applications, <br />
                  <span className="text-[#2563EB]">made simpler.</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                  Apply for official licenses and permits with step-by-step voice guidance, automated document checks, and transparent, real-time application tracking.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onRegisterClick}
                    className="px-6 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onExploreServices}
                    className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#101828] font-bold text-xs sm:text-sm rounded-2xl border border-slate-300 shadow-xs transition flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-slate-500" />
                    <span>Explore Services</span>
                  </button>
                </div>

                <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span>Bilingual (English & Telugu)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span>Explainable AI Checks</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span>Role-Based Security</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Visual Preview Mockup Card */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/90 relative">
                  {/* Assistant Preview Banner */}
                  <div className="bg-gradient-to-br from-[#101828] via-[#162544] to-[#2563EB] rounded-2xl p-5 text-white mb-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                          <Mic className="w-4 h-4 text-[#EAF2FF]" />
                        </div>
                        <span className="text-xs font-bold">Voice Application Assistant</span>
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                        Ready
                      </span>
                    </div>
                    <p className="text-xs text-[#EAF2FF] leading-relaxed">
                      "What is your full name as shown on your Aadhaar card?"
                    </p>
                  </div>

                  {/* Sample Status Stream Card */}
                  <div className="space-y-2.5">
                    <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileCheck2 className="w-4 h-4 text-[#2563EB]" />
                        <div>
                          <p className="text-xs font-bold text-[#101828]">Driving License</p>
                          <p className="text-[10px] text-slate-400 font-mono">DRL-2026-001</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/30">
                        APPROVED
                      </span>
                    </div>

                    <div className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-[#B45309]" />
                        <div>
                          <p className="text-xs font-bold text-[#101828]">Trade License Permit</p>
                          <p className="text-[10px] text-slate-400 font-mono">TRL-2026-015</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/30">
                        REVIEW REQUIRED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 CORE PILLARS SECTION */}
        <section id="features" className="py-14 sm:py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828]">
                Built for Citizens, Officers, and Administrators
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Designed to make government licensing fast, inclusive, and transparent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-[#F8FAFC] rounded-3xl p-6 border border-slate-200 hover:border-[#2563EB]/40 transition shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#101828] mb-2">Voice Assistance</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete applications using natural spoken voice prompts with real-time read-back confirmation in Telugu and English.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#F8FAFC] rounded-3xl p-6 border border-slate-200 hover:border-[#2563EB]/40 transition shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center mb-4">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#101828] mb-2">Document Intelligence</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated OCR pre-screening checks documents instantly and flags mismatches with clear, human-understandable guidance.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#F8FAFC] rounded-3xl p-6 border border-slate-200 hover:border-[#2563EB]/40 transition shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#101828] mb-2">Track Every Step</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time status updates, chronological milestone tracking, and 1-tap resubmission for any requested corrections.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-14 sm:py-16 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828]">How It Works</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Four simple steps to submit and track your license applications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-xs">
                  1
                </div>
                <h4 className="text-xs font-bold text-[#101828]">Choose a Service</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Browse driving licenses, municipal trade permits, and certificates from the public catalogue.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-xs">
                  2
                </div>
                <h4 className="text-xs font-bold text-[#101828]">Complete Application</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Fill details manually or speak using the interactive voice assistant with instant validation.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-xs">
                  3
                </div>
                <h4 className="text-xs font-bold text-[#101828]">Upload Documents</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Securely upload proofs and review automated OCR pre-screening findings for complete accuracy.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#15803D] text-white flex items-center justify-center font-extrabold text-xs">
                  4
                </div>
                <h4 className="text-xs font-bold text-[#101828]">Track & Get Updates</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Follow departmental review in real time and download your approved digital certificate.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-[#101828]">Smart Digital Licensing Platform</span>
          </div>

          <p className="text-[11px] text-slate-400 text-center sm:text-right">
            Academic Research Prototype &bull; Designed according to IEEE Capstone Specification
          </p>
        </div>
      </footer>
    </div>
  );
};
