import React, { useState } from 'react';
import {
  Search,
  Sliders,
  Bell,
  HelpCircle,
  ChevronDown,
  Clock,
  FileText,
  Building,
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
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  const searchSuggestions = [
    { label: language === 'te' ? 'గుర్తింపు కార్డు' : 'Identity card', query: 'Identity' },
    { label: language === 'te' ? 'డ్రైవింగ్ లైసెన్స్' : 'Driving license', query: 'Driving' },
    { label: language === 'te' ? 'ట్రేడ్ లైసెన్స్' : 'Trade license', query: 'Trade' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginClick();
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    onLoginClick();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#101828] flex flex-col font-sans select-none overflow-x-hidden">
      {/* 1. TOP STATE BANNER */}
      <div className="w-full bg-white border-b border-slate-200/80 px-4 sm:px-8 py-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          {/* Official Emblem Icon */}
          <div className="w-4 h-4 rounded-full bg-[#101828] flex items-center justify-center text-white text-[9px] font-black">
            🏛
          </div>
          <span className="font-semibold text-slate-700 tracking-tight">
            {language === 'te'
              ? 'తెలంగాణ & ఆంధ్రప్రదేశ్ ప్రభుత్వ డిజిటల్ సేవల పోర్టల్'
              : 'Government Public Digital Services Portal'}
          </span>
        </div>

        {/* Bilingual Language Switcher */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onLanguageChange('te')}
            className={`px-1.5 py-0.5 rounded transition ${
              language === 'te' ? 'text-[#2563EB] font-bold underline' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            తె
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-1.5 py-0.5 rounded transition ${
              language === 'en' ? 'text-[#2563EB] font-bold underline' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            En
          </button>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-6">
            {/* Glowing App Emblem (like the circular EVO logo in screenshot) */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={onExploreServices}>
              <div className="relative w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-md p-0.5 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB] via-[#9333EA] to-[#06B6D4] opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-full h-full bg-[#101828] rounded-[14px] flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-[#06B6D4] border-t-[#9333EA] border-r-[#2563EB] animate-spin-slow flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
                  </div>
                </div>
              </div>
              <span className="font-black text-xl tracking-tight text-[#101828] hidden sm:inline-block">
                SLP
              </span>
            </div>

            {/* Navigation links */}
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-700">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5 text-slate-800"
                >
                  <span>{language === 'te' ? 'సేవలు' : 'Services'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isServicesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setIsServicesDropdownOpen(false);
                        onLoginClick();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-800 block"
                    >
                      🚗 Driving & Transport Licenses
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsServicesDropdownOpen(false);
                        onLoginClick();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-800 block"
                    >
                      🏬 Municipal & Trade Licenses
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsServicesDropdownOpen(false);
                        onLoginClick();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-800 block"
                    >
                      📄 Certificates & Verification
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onLoginClick}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 transition text-slate-600"
              >
                {language === 'te' ? 'జీవిత సంఘటనలు' : 'Life Events'}
              </button>
            </div>
          </div>

          {/* Right: Icon Actions & Profile / Login Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onLoginClick}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onLoginClick}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              title="Help & Support"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenAccessibility}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition hidden sm:inline-flex"
              title="Accessibility & Setup"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onLoginClick}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
            </button>

            {/* User Avatar / Login Trigger */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onRegisterClick}
                className="hidden sm:inline-block px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-[#2563EB] transition"
              >
                {language === 'te' ? 'నమోదు' : 'Register'}
              </button>
              <button
                type="button"
                onClick={onLoginClick}
                className="pl-2 pr-3.5 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-slate-200 rounded-full flex items-center gap-2 transition group"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  SM
                </div>
                <span className="text-xs font-bold text-[#101828] group-hover:text-[#2563EB]">
                  {language === 'te' ? 'ప్రవేశం' : 'Log In'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. HERO CANVAS WITH TOPOGRAPHIC WAVES & FLOATING WIDGET CARDS */}
      <main className="flex-1 relative flex flex-col items-center justify-center px-4 sm:px-8 py-12 md:py-20 overflow-hidden bg-gradient-to-b from-[#F3F0FF]/60 via-[#F8FAFC] to-[#EDE9FE]/40">
        {/* Subtle SVG Topographic Curves in background (exactly like Moldova EVO screenshot) */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none" preserveAspectRatio="none">
            <path
              d="M-100,200 C300,50 600,350 1000,150 C1300,0 1500,250 1600,200"
              stroke="#A78BFA"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M-50,380 C250,220 700,520 1100,320 C1400,180 1550,420 1650,380"
              stroke="#C4B5FD"
              strokeWidth="1.2"
            />
            <path
              d="M-80,550 C320,400 800,680 1200,480 C1450,350 1600,600 1700,550"
              stroke="#DDD6FE"
              strokeWidth="1.2"
            />
            <path
              d="M-120,720 C280,600 750,820 1150,650 C1420,520 1580,750 1680,700"
              stroke="#EDE9FE"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* FLOATING CARD 1 (Top Left) - Application for residence / driving certificate */}
        <div
          onClick={onLoginClick}
          className="hidden lg:block absolute left-8 top-16 w-72 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer z-20 group animate-in fade-in"
        >
          {/* Avatar marker pin above */}
          <div className="absolute -top-6 left-12 flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
              VC
            </div>
            <div className="w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-white" />
          </div>

          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="px-2 py-0.5 rounded-full font-bold bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20">
              Valid
            </span>
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Expires on 12 Jun 2026</span>
            </span>
          </div>

          <h4 className="text-xs font-extrabold text-[#101828] group-hover:text-[#2563EB] transition-colors">
            Application for residence certificate
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">State Tax & Transport Service</p>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold flex items-center justify-center">
              VC
            </div>
            <span className="text-[11px] font-semibold text-slate-700">Vadim Cebotari</span>
          </div>
        </div>

        {/* FLOATING CARD 2 (Bottom Left) - Tax Situation / Document Verification */}
        <div
          onClick={onLoginClick}
          className="hidden lg:block absolute left-12 bottom-12 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-rose-200/80 shadow-md hover:shadow-lg transition-all cursor-pointer z-20 group animate-in fade-in"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Verify
            </span>
          </div>
          <h4 className="text-xs font-extrabold text-[#101828] group-hover:text-[#2563EB] transition-colors">
            Tax Situation & Licensing
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">AI OCR Pre-Screening Ready</p>
        </div>

        {/* FLOATING CARD 3 (Top Right) - Compensation for energy / Trade Permit */}
        <div
          onClick={onLoginClick}
          className="hidden lg:block absolute right-8 top-20 w-72 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer z-20 group animate-in fade-in"
        >
          {/* Avatar marker pin */}
          <div className="absolute -bottom-5 left-10 flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
              SM
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Social benefits & permits
            </span>
            <span className="text-slate-400 font-bold text-xs tracking-widest">•••</span>
          </div>

          <h4 className="text-xs font-extrabold text-[#101828] group-hover:text-[#2563EB] transition-colors">
            Compensation for energy
          </h4>

          <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <span className="text-blue-500 font-bold">🛡</span>
            <span>MD81V12259116034909843722</span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
            <span>📅 March 15, 2026</span>
          </div>
        </div>

        {/* FLOATING CARD 4 (Bottom Right) - Social Insurance / CNAS */}
        <div
          onClick={onLoginClick}
          className="hidden lg:block absolute right-12 bottom-12 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-md hover:shadow-lg transition-all cursor-pointer z-20 group animate-in fade-in"
        >
          <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Building className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-extrabold text-[#101828] group-hover:text-[#2563EB] transition-colors">
            Social Insurance (CNAS)
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Municipal & Trade Welfare</p>
        </div>

        {/* CENTER HERO CONTENT */}
        <div className="relative z-10 max-w-2xl w-full text-center space-y-6 sm:space-y-7">
          {/* Dual Emblems Side-by-Side (Exactly like reference image: State Crest + App Logo) */}
          <div className="flex items-center justify-center gap-3.5">
            {/* Left: Official State Emblem Crest */}
            <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] border-2 border-blue-400/40 shadow-md flex items-center justify-center p-2 text-white">
              <span className="text-2xl">🏛️</span>
            </div>

            {/* Right: Glowing App Crest (EVO Style) */}
            <div className="w-14 h-14 rounded-2xl bg-black border-2 border-purple-500/50 shadow-lg flex items-center justify-center p-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB] via-[#9333EA] to-[#06B6D4] opacity-80" />
              <div className="relative w-full h-full bg-[#101828] rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-3 border-[#06B6D4] border-t-[#9333EA] border-r-[#2563EB] animate-spin-slow flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Headline - "The state is here for you" */}
          <h1 className="text-3xl sm:text-5xl md:text-5xl font-black text-[#101828] tracking-tight leading-tight">
            {language === 'te' ? 'ప్రభుత్వం మీ సేవలో ఉంది' : 'The state is here for you'}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {language === 'te'
              ? 'డిజిటల్ పబ్లిక్ సర్వీసెస్, వ్యాపార మరియు వ్యక్తిగత డేటాను పొందండి — మీ అధికారిక ప్రభుత్వ పోర్టల్.'
              : 'Discover information and digital public services, and access data about you and your business from Smart Licensing - the unique government portal.'}
          </p>

          {/* Prominent Search Bar (Just like in screenshot) */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto w-full">
            <div className="relative flex items-center shadow-lg rounded-2xl bg-white border border-slate-200/90 focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:border-[#2563EB] transition-all">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  language === 'te'
                    ? 'కావలసిన సేవ కోసం శోధించండి...'
                    : 'Search for the desired service'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-transparent text-sm sm:text-base text-[#101828] placeholder-slate-400 font-medium focus:outline-none rounded-2xl"
              />
              <button
                type="submit"
                className="absolute right-3 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                {language === 'te' ? 'వెతుకు' : 'Search'}
              </button>
            </div>
          </form>

          {/* Search Examples Row underneath */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs text-slate-500 pt-1">
            <span>{language === 'te' ? 'ఉదాహరణలు:' : 'Search examples:'}</span>
            {searchSuggestions.map((item, idx) => (
              <React.Fragment key={item.query}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(item.query)}
                  className="font-bold text-[#2563EB] hover:underline"
                >
                  {item.label}
                </button>
                {idx < searchSuggestions.length - 1 && <span>,</span>}
              </React.Fragment>
            ))}
          </div>

          {/* MOBILE RESPONSIVE WIDGET GRID (Visible on small screens where floating cards are hidden) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 lg:hidden text-left">
            <div
              onClick={onLoginClick}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs cursor-pointer active:scale-98 transition"
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="px-2 py-0.5 rounded-full font-bold bg-[#15803D]/10 text-[#15803D]">
                  Valid
                </span>
                <span className="text-slate-400 font-medium">Expires 12 Jun 2026</span>
              </div>
              <h4 className="text-xs font-bold text-[#101828]">Residence & Driving Certificate</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Department of Transport</p>
            </div>

            <div
              onClick={onLoginClick}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs cursor-pointer active:scale-98 transition"
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-400 font-bold uppercase">Social benefits</span>
                <span className="text-blue-500 font-bold">MD81V1225...</span>
              </div>
              <h4 className="text-xs font-bold text-[#101828]">Compensation & Trade Permits</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Municipal Administration</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
