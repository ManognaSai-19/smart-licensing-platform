import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Layers,
  FileText,
  Bell,
  User as UserIcon,
  HelpCircle,
  LogOut,
  Sliders,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  FlaskConical,
  Mic,
  ChevronDown,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface AppShellProps {
  children: React.ReactNode;
  activeNav: string;
  onNavigate: (navKey: string) => void;
  onOpenAccessibility: () => void;
  language: 'en' | 'te';
  onLanguageChange: (lang: 'en' | 'te') => void;
  onTriggerVoice?: () => void;
  unreadNotificationsCount?: number;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeNav,
  onNavigate,
  onOpenAccessibility,
  language,
  onLanguageChange,
  onTriggerVoice,
  unreadNotificationsCount = 2,
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const role = user?.role || 'CITIZEN';

  // Navigation Items by Role
  const citizenNav: NavItem[] = [
    { key: 'citizen-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'explore-services', label: 'Explore Services', icon: Layers },
    { key: 'my-applications', label: 'My Applications', icon: FileText },
    { key: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    { key: 'profile', label: 'Profile', icon: UserIcon },
    { key: 'help', label: 'Help', icon: HelpCircle },
  ];

  const officerNav: NavItem[] = [
    { key: 'officer-queue', label: 'Adjudication Queue', icon: UserCheck },
    { key: 'explore-services', label: 'Services Catalogue', icon: Layers },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'profile', label: 'Profile', icon: UserIcon },
    { key: 'help', label: 'Help & Guidelines', icon: HelpCircle },
  ];

  const adminNav: NavItem[] = [
    { key: 'admin-dashboard', label: 'System Overview', icon: ShieldCheck },
    { key: 'explore-services', label: 'Service Catalogue', icon: Layers },
    { key: 'research-benchmark', label: 'Research Benchmark', icon: FlaskConical },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'OFFICER' ? officerNav : citizenNav;

  const currentNavTitle =
    navItems.find((item) => item.key === activeNav)?.label ||
    (activeNav === 'my-applications' ? 'My Applications' : 'Dashboard');

  const handleNavClick = (key: string) => {
    onNavigate(key);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#EAF2FF] selection:text-[#2563EB]">
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Mobile Menu Toggle & Brand / Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onNavigate(role === 'ADMIN' ? 'admin-dashboard' : role === 'OFFICER' ? 'officer-queue' : 'citizen-dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#101828] text-white flex items-center justify-center font-extrabold shadow-sm group-hover:bg-[#2563EB] transition-colors">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-[#0F172A] text-sm tracking-tight leading-none block">
                Smart Licensing
              </span>
              <span className="text-[10px] font-semibold text-[#64748B] leading-none mt-1 block">
                {role === 'ADMIN' ? 'Admin Portal' : role === 'OFFICER' ? 'Officer Queue' : 'Citizen Portal'}
              </span>
            </div>
          </div>

          {/* Breadcrumb separator and active page title on desktop */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 ml-2">
            <span className="text-xs text-slate-400 font-medium">/</span>
            <span className="text-xs font-bold text-[#0F172A]">{currentNavTitle}</span>
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200 rounded-xl p-1 text-xs font-bold text-slate-700">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-lg transition ${
                language === 'en' ? 'bg-white text-[#2563EB] shadow-xs' : 'hover:text-[#0F172A]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('te')}
              className={`px-2.5 py-1 rounded-lg transition ${
                language === 'te' ? 'bg-white text-[#2563EB] shadow-xs' : 'hover:text-[#0F172A]'
              }`}
            >
              తెలుగు
            </button>
          </div>

          {/* Voice Assistant Shortcut */}
          {onTriggerVoice && (
            <button
              type="button"
              onClick={onTriggerVoice}
              title="Launch Spoken Voice Assistant"
              className="p-2 text-[#2563EB] bg-[#EAF2FF] hover:bg-[#dbe9fe] rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Voice Help</span>
            </button>
          )}

          {/* Accessibility Settings Shortcut */}
          <button
            type="button"
            onClick={onOpenAccessibility}
            title="Accessibility & Language Preferences"
            className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-slate-100 rounded-xl transition"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Notifications Trigger */}
          <button
            type="button"
            onClick={() => onNavigate('notifications')}
            title="Notifications"
            className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-slate-100 rounded-xl transition relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B91C1C] ring-2 ring-white" />
            )}
          </button>

          {/* User Profile Chip */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl hover:bg-slate-100 border border-slate-200 transition"
            >
              <div className="w-7 h-7 rounded-xl bg-[#EAF2FF] text-[#2563EB] font-black text-xs flex items-center justify-center">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <span className="font-bold text-[#0F172A] block truncate max-w-[120px]">
                  {user?.fullName || 'User'}
                </span>
                <span className="text-[10px] font-semibold text-[#64748B] capitalize">
                  {role.toLowerCase()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in"
                onClick={() => setUserDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-[#0F172A]">{user?.fullName}</p>
                  <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-[#EAF2FF] hover:text-[#2563EB] flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAccessibility}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-[#EAF2FF] hover:text-[#2563EB] flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Accessibility Preferences</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-[#EAF2FF] hover:text-[#2563EB] flex items-center gap-2"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span className="flex items-center gap-1">
                    <span>Install Mobile App</span>
                    <Sparkles className="w-3 h-3 text-[#2563EB]" />
                  </span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  type="button"
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-xs text-[#B91C1C] hover:bg-rose-50 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY WITH PERSISTENT SIDEBAR + CONTENT */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-4 shrink-0">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#EAF2FF] text-[#2563EB]'
                      : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#2563EB] text-white shrink-0 ml-auto">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Info */}
          <div className="mt-auto pt-6 border-t border-slate-100 space-y-3">
            <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Logged in as
              </span>
              <p className="text-xs font-bold text-[#0F172A] mt-0.5 truncate">{user?.fullName}</p>
              <span className="text-[10px] font-semibold text-[#2563EB] bg-[#EAF2FF] px-2 py-0.5 rounded-full inline-block mt-1">
                {role}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#64748B] hover:text-[#B91C1C] hover:bg-rose-50 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MOBILE COLLAPSIBLE DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col p-4 z-10 animate-in slide-in-from-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-xs text-[#0F172A]">Smart Licensing</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleNavClick(item.key)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#EAF2FF] text-[#2563EB]'
                          : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#2563EB] text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#B91C1C] hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN PAGE CONTENT WRAPPER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* MOBILE FLOATING VOICE ACTION BUTTON (FAB) */}
      {onTriggerVoice && (
        <button
          type="button"
          onClick={onTriggerVoice}
          title="Voice Assistant"
          aria-label="Activate Voice Assistant"
          className="md:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-2xl bg-[#2563EB] text-white shadow-xl shadow-blue-500/30 flex items-center justify-center border-2 border-white active:scale-95 transition-transform"
        >
          <Mic className="w-5 h-5 animate-pulse" />
        </button>
      )}

      {/* MOBILE PERSISTENT BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 pt-2 z-40 shadow-lg"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.key)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl text-[10px] font-bold transition-all relative ${
                  isActive
                    ? 'text-[#2563EB] bg-[#EAF2FF] shadow-2xs scale-105'
                    : 'text-[#64748B] hover:text-[#0F172A] active:scale-95'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-[#B91C1C] ring-2 ring-white" />
                  )}
                </div>
                <span className="truncate max-w-[62px] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
