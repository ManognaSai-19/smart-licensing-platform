import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Cpu,
  ShieldCheck,
  Volume2,
  AlertTriangle,
  Layers,
  Activity
} from 'lucide-react';
import { ServiceCatalogue } from './components/ServiceCatalogue';

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

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalogue' | 'health'>('catalogue');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
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

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('catalogue')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'catalogue'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Service Catalogue</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('health')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'health'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>System Health</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalogue' ? (
          <ServiceCatalogue />
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

            {/* Health Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Status Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Overall Health
                    </span>
                    <Server className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex items-center space-x-3">
                    {loading && !health ? (
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : health?.status === 'UP' ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    ) : (
                      <XCircle className="w-7 h-7 text-rose-600" />
                    )}
                    <div>
                      <div className="text-2xl font-bold text-slate-900">
                        {loading && !health ? 'Probing...' : health?.status || 'DOWN'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {health?.service || 'backend-service'}
                      </div>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Latency Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Roundtrip Latency
                    </span>
                    <Cpu className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {latencyMs !== null ? `${latencyMs} ms` : '—'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    HTTP proxy round-trip time
                  </p>
                </div>
                <div className="text-xs text-slate-400 pt-4 border-t border-slate-100">
                  Last checked: {lastChecked || 'Never'}
                </div>
              </div>

              {/* Security & Engine */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Framework & Security
                    </span>
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    Spring Boot 3.3.4 + JJWT 0.12
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Flyway V2 Schema & Seed Data Initialized
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Speech Subsystem: Ready (Web Speech API)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
