import { useEffect, useState } from 'react';
import {
  FileText,
  UserCheck,
  ShieldCheck,
  Layers,
  FlaskConical,
  LogOut,
  Shield,
} from 'lucide-react';
import { ServiceCatalogue } from './components/ServiceCatalogue';
import { CitizenDashboard } from './components/CitizenDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ResearchBenchmarkView } from './components/ResearchBenchmarkView';
import { MobileAuthScreen } from './components/MobileAuthScreen';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainApp() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'citizen' | 'officer' | 'admin' | 'catalogue' | 'research'>('citizen');

  // Auto-route tabs based on user role upon login
  useEffect(() => {
    if (user?.role === 'OFFICER') {
      setActiveTab('officer');
    } else if (user?.role === 'ADMIN') {
      setActiveTab('admin');
    } else if (user?.role === 'CITIZEN') {
      setActiveTab('citizen');
    }
  }, [user?.role]);

  // If not logged in, immediately show the clean Mobile Login/Register screen
  if (!isAuthenticated) {
    return <MobileAuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-900 sm:py-6 flex justify-center items-center font-sans">
      {/* Smartphone Frame Container */}
      <div className="w-full sm:max-w-md bg-slate-50 min-h-screen sm:min-h-[850px] sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80 relative">
        {/* Mobile App Header */}
        <header className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">Smart Licensing</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {user?.role || 'CITIZEN'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none mt-1">
                Hi, {user?.fullName?.split(' ')[0] || 'User'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Mobile Body */}
        <main className="flex-1 overflow-y-auto pb-16">
          {activeTab === 'citizen' ? (
            <CitizenDashboard />
          ) : activeTab === 'officer' ? (
            <div className="p-4">
              <OfficerDashboard />
            </div>
          ) : activeTab === 'admin' ? (
            <div className="p-4">
              <AdminDashboard />
            </div>
          ) : activeTab === 'catalogue' ? (
            <div className="p-4">
              <ServiceCatalogue />
            </div>
          ) : activeTab === 'research' ? (
            <div className="p-4">
              <ResearchBenchmarkView />
            </div>
          ) : null}
        </main>

        {/* Mobile Sticky Bottom Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 px-2 py-2 flex items-center justify-around z-30 shadow-lg">
          {user?.role === 'CITIZEN' && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('citizen')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'citizen' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Licenses</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('catalogue')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'catalogue' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Services</span>
              </button>
            </>
          )}

          {user?.role === 'OFFICER' && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('officer')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'officer' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Officer Queue</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('catalogue')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'catalogue' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Services</span>
              </button>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'admin' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('catalogue')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'catalogue' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Services</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('research')}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                  activeTab === 'research' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>Research</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
