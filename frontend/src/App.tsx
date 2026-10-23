import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Cpu,
  ShieldCheck,
  Volume2,
  AlertTriangle
} from 'lucide-react';

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
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px', width: '100%' }}>
      {/* Header */}
      <header style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '4px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
              Phase 1: Skeleton & Health Checks
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Smart Digital Licensing Platform
            </h1>
            <p style={{ color: '#64748b', fontSize: '15px', marginTop: '4px' }}>
              A Voice-First, Explainable AI Framework for Accessible Digital Applications and Intelligent Document Pre-Screening
            </p>
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Checking Health...' : 'Refresh Health'}
          </button>
        </div>
      </header>

      {/* Main Status Panel */}
      <main style={{ display: 'grid', gap: '24px' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Server size={24} color="#2563eb" />
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                Backend REST API Integration Status
              </h2>
            </div>
            {health && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: '#dcfce7',
                  color: '#166534',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} /> Backend Online (Status: {health.status})
              </span>
            )}
            {error && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <XCircle size={16} /> Backend Offline
              </span>
            )}
          </div>

          {loading && !health && (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
              <p>Connecting to backend API at <code>http://localhost:8080/api/health</code>...</p>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#991b1b',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '6px' }}>
                <AlertTriangle size={18} /> Connection Error
              </div>
              <p>{error}</p>
              <p style={{ marginTop: '8px', fontSize: '13px', color: '#7f1d1d' }}>
                Verify that the Spring Boot backend server is running on port 8080.
              </p>
            </div>
          )}

          {health && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Service Name</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>{health.service}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>API Version</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>v{health.version}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Round-trip Latency</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>{latencyMs} ms</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Last Polled</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>{lastChecked}</div>
              </div>
            </div>
          )}

          {health?.details && (
            <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>
                System Module Configuration (Reported by Live Backend)
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ padding: '6px 12px', background: '#e0e7ff', color: '#3730a3', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>
                  Env: {health.details.environment}
                </span>
                <span style={{ padding: '6px 12px', background: '#fef3c7', color: '#92400e', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>
                  Database: {health.details.database}
                </span>
                <span style={{ padding: '6px 12px', background: '#f3e8ff', color: '#6b21a8', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>
                  OCR Provider: {health.details.ocrProvider}
                </span>
                <span style={{ padding: '6px 12px', background: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>
                  Speech Fallback: {health.details.speechFallback}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* System Blueprints Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Volume2 size={20} color="#0284c7" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Voice-First Assistance</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
              Bilingual support (English & Telugu) via Web Speech API with explicit read-back confirmation and guaranteed text-entry fallback.
            </p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Cpu size={20} color="#7c3aed" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Explainable Pre-Screening</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
              Rule-based validation of OCR document extractions against form submissions. Advisory explanations route uncertain cases to human review.
            </p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldCheck size={20} color="#059669" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Human-in-the-Loop Security</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
              Department-scoped officer queue and mandatory rejection reasons. Backend enforces citizen record isolation and role security.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
