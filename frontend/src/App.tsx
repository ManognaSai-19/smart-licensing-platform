import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Cpu,
  Layers,
  Activity,
  Mic,
  FileText,
  AlertTriangle,
  LogIn,
  LogOut,
} from 'lucide-react';
import { ServiceCatalogue } from './components/ServiceCatalogue';
import { VoiceDashboard } from './components/VoiceDashboard';
import { CitizenDashboard } from './components/CitizenDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

interface HealthData {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  details?: {
    environment?: string;
    database?: string;
    ocrProvider?: string;
    speechFallback?: string;
    [key: string]: unknown;
  };
}

function MainApp() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'citizen' | 'catalogue' | 'voice' | 'health'>('citizen');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const response = await fetch('/api/health', {
        headers: { Accept: 'application/json' },
      });
      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setLastChecked(new Date().toLocaleTimeString());

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: HealthData = await response.json();
      setHealth(data);
    } catch (err: unknown) {
      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setLastChecked(new Date().toLocaleTimeString());
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend';
      setError(msg);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              SL
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Smart Digital Licensing Platform
              </h1>
              <p className="text-xs text-slate-500">
                Voice-First Accessible Applications & Pre-Screening Framework
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('citizen')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'citizen'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Citizen Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('catalogue')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'catalogue'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Service Catalogue</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'voice'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-indigo-600" />
                <span>Voice Assistant</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('health')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'health'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>System Health</span>
              </button>
            </div>

            {/* Auth Pill */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-slate-800 hidden sm:inline">{user.fullName}</span>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-red-600 p-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'citizen' ? (
          <CitizenDashboard />
        ) : activeTab === 'catalogue' ? (
          <ServiceCatalogue />
        ) : activeTab === 'voice' ? (
          <VoiceDashboard />
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Core Runtime & Service Connectivity
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Live end-to-end communication diagnostics between frontend Vite proxy and Spring Boot backend.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchHealth}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Now</span>
              </button>
            </div>

            {/* Health Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Status Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Backend Status
                  </span>
                  {health?.status === 'UP' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-3xl font-extrabold ${health?.status === 'UP' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {loading && !health ? 'Checking...' : health?.status || 'DOWN'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Latency: <span className="font-semibold text-slate-700">{latencyMs !== null ? `${latencyMs}ms` : '---'}</span> &bull; Checked: {lastChecked || 'Never'}
                </p>
              </div>

              {/* Service Version Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Application Info
                  </span>
                  <Server className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-lg font-bold text-slate-800 truncate">
                  {health?.service || 'smart-licensing-platform'}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Version: <span className="font-semibold text-slate-700">{health?.version || '0.1.0-SNAPSHOT'}</span>
                </p>
              </div>

              {/* Database & Persistence Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Persistence Engine
                  </span>
                  <Cpu className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-lg font-bold text-slate-800">
                  {health?.details?.database || 'Flyway + JPA (V3)'}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  14 Schema Tables &bull; Voice Telemetry Enabled
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold">Backend Connection Failed</h4>
                  <p className="text-xs text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
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
