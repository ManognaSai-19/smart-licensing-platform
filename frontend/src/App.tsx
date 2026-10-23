import { useEffect, useState } from 'react';
import { ServiceCatalogue } from './components/ServiceCatalogue';
import { CitizenDashboard } from './components/CitizenDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ResearchBenchmarkView } from './components/ResearchBenchmarkView';
import { MobileAuthScreen } from './components/MobileAuthScreen';
import { LandingPage } from './components/LandingPage';
import { AppShell } from './components/AppShell';
import { AccessibilitySetupModal } from './components/AccessibilitySetupModal';
import { InstallPwaPrompt } from './components/InstallPwaPrompt';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

function MainApp() {
  const { user, isAuthenticated } = useAuth();

  // Navigation State
  const [activeNav, setActiveNav] = useState<string>('citizen-dashboard');

  // Modals & Preferences State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'te'>('en');

  // Load language preference from storage if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smart_licensing_accessibility');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguage(parsed.language);
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-route active navigation based on user role upon login
  useEffect(() => {
    if (user?.role === 'OFFICER') {
      setActiveNav('officer-queue');
    } else if (user?.role === 'ADMIN') {
      setActiveNav('admin-dashboard');
    } else if (user?.role === 'CITIZEN') {
      setActiveNav('citizen-dashboard');
    }
  }, [user?.role]);

  // UN-AUTHENTICATED: Show Public Landing Page & Auth Modal
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage
          onLoginClick={() => {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }}
          onRegisterClick={() => {
            setAuthMode('register');
            setIsAuthModalOpen(true);
          }}
          onExploreServices={() => {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }}
          onOpenAccessibility={() => setIsAccessibilityOpen(true)}
          language={language}
          onLanguageChange={setLanguage}
        />

        {isAuthModalOpen && (
          <MobileAuthScreen
            initialMode={authMode}
            onClose={() => setIsAuthModalOpen(false)}
          />
        )}

        <AccessibilitySetupModal
          isOpen={isAccessibilityOpen}
          onClose={() => setIsAccessibilityOpen(false)}
          onSave={(prefs) => setLanguage(prefs.language)}
        />

        {/* PWA Mobile Installation Prompt */}
        <InstallPwaPrompt />
      </>
    );
  }

  // AUTHENTICATED: Show Full Responsive AppShell with Role-based Views
  return (
    <AppShell
      activeNav={activeNav}
      onNavigate={setActiveNav}
      onOpenAccessibility={() => setIsAccessibilityOpen(true)}
      language={language}
      onLanguageChange={setLanguage}
    >
      {/* CITIZEN DASHBOARD */}
      {(activeNav === 'citizen-dashboard' || activeNav === 'my-applications') && (
        <CitizenDashboard onNavigate={setActiveNav} />
      )}

      {/* EXPLORE SERVICES CATALOGUE */}
      {activeNav === 'explore-services' && (
        <div className="space-y-4">
          <ServiceCatalogue />
        </div>
      )}

      {/* OFFICER QUEUE & CASE MANAGEMENT */}
      {activeNav === 'officer-queue' && (
        <div className="space-y-4">
          <OfficerDashboard />
        </div>
      )}

      {/* ADMIN DASHBOARD */}
      {activeNav === 'admin-dashboard' && (
        <div className="space-y-4">
          <AdminDashboard />
        </div>
      )}

      {/* RESEARCH BENCHMARK */}
      {activeNav === 'research-benchmark' && (
        <div className="space-y-4">
          <ResearchBenchmarkView />
        </div>
      )}

      {/* NOTIFICATIONS FEED (Screen 15 Preview) */}
      {activeNav === 'notifications' && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#101828]">Notifications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time alerts and application milestone updates</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB]">
              2 Unread
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#15803D]/10 text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#101828]">Application Approved</h4>
                  <span className="text-[10px] text-slate-400">10 mins ago</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Your Driving License application (ref: <span className="font-mono text-[#2563EB] font-bold">DRL-2026-001</span>) has been approved by the Transport Department.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#101828]">Document Update Required</h4>
                  <span className="text-[10px] text-slate-400">2 hours ago</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Officer notes: Please upload a clearer copy of address proof for application <span className="font-mono text-[#2563EB] font-bold">TRL-2026-015</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER PROFILE & PREFERENCES (Screen 15 Preview) */}
      {activeNav === 'profile' && (
        <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-xl font-extrabold text-[#101828]">My Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">Account credentials and accessibility settings</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#2563EB] font-extrabold text-xl flex items-center justify-center">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">{user?.fullName}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="text-[10px] font-bold text-[#2563EB] bg-[#EAF2FF] px-2 py-0.5 rounded-full inline-block mt-1">
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Phone Number</span>
                <span className="font-bold text-[#101828] mt-0.5 block">{user?.phoneNumber || 'Not provided'}</span>
              </div>

              <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Current Language</span>
                <span className="font-bold text-[#101828] mt-0.5 block">{language === 'en' ? 'English (Default)' : 'Telugu (తెలుగు)'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAccessibilityOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 hover:border-[#2563EB] text-[#101828] text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <span>Change Language & Accessibility Preferences</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP & SUPPORT FAQ (Screen 15 Preview) */}
      {activeNav === 'help' && (
        <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-xl font-extrabold text-[#101828]">Help & Guidelines</h2>
            <p className="text-xs text-slate-500 mt-0.5">Everything you need to know about applying and using voice guidance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-[#101828]">How does Voice Assistance work?</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                When filling any application form, tap the microphone button or the voice banner to speak your answers in English or Telugu. The system transcribes and reads back your input for confirmation.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-[#101828]">What does Document Pre-Screening do?</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Our automated OCR checks extracted text against your entered form fields to help you catch typos before submission. AI findings are purely advisory and never reject applications automatically.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-[#101828]">What happens if my application is rejected?</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                You will see a prominent explanation detailing the reviewing officer's reason, along with a 1-tap "Fix & Resubmit" button that retains your previous entries.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-[#101828]">How can I track my application status?</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Use the "Check Status" card on your dashboard by entering your reference number, or check the "Applied Till Now" list for milestone timestamps.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Setup Modal */}
      <AccessibilitySetupModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        onSave={(prefs) => setLanguage(prefs.language)}
      />

      {/* PWA Mobile Installation Prompt */}
      <InstallPwaPrompt />
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
