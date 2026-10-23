import React, { useState, useEffect } from 'react';
import { PrescreeningSummary, FindingOutcome } from '../types/prescreening';
import { prescreeningApi } from '../services/prescreeningApi';

interface PrescreeningFindingsViewProps {
  applicationId: number;
  language: 'en' | 'te';
  onRunComplete?: (summary: PrescreeningSummary) => void;
}

export const PrescreeningFindingsView: React.FC<PrescreeningFindingsViewProps> = ({
  applicationId,
  language,
  onRunComplete,
}) => {
  const [summary, setSummary] = useState<PrescreeningSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'FAIL' | 'WARNING' | 'NEEDS_MANUAL_REVIEW' | 'PASS'>('ALL');
  const [showOcrInspector, setShowOcrInspector] = useState<boolean>(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await prescreeningApi.getSummary(applicationId);
      setSummary(data);
    } catch (err: any) {
      // Summary may be empty if not run yet
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPrescreening = async () => {
    try {
      setRunning(true);
      setErrorMsg(null);
      const result = await prescreeningApi.runPrescreening(applicationId);
      setSummary(result);
      if (onRunComplete) onRunComplete(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Pre-screening execution failed');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchSummary();
    }
  }, [applicationId]);

  const getStatusBadge = (status: PrescreeningSummary['overallStatus']) => {
    switch (status) {
      case 'PASSED':
        return {
          bg: '#d1fae5',
          color: '#065f46',
          text: language === 'te' ? '✓ పూర్వ-పరిశీలన ఆమోదించబడింది' : '✓ Pre-Screening Cleared (Ready for Submission)',
        };
      case 'NEEDS_MANUAL_REVIEW':
        return {
          bg: '#ede9fe',
          color: '#5b21b6',
          text: language === 'te' ? '🔍 అధికారి మాన్యువల్ పరిశీలనకు నిర్దేశించబడింది (జరిమానా లేదు)' : '🔍 Routed for Officer Manual Inspection (No Penalty)',
        };
      case 'HAS_WARNINGS':
        return {
          bg: '#fef3c7',
          color: '#92400e',
          text: language === 'te' ? '⚠️ చిన్నపాటి వ్యత్యాసాలు గమనించబడ్డాయి' : '⚠️ Minor Variations Noted (Review Suggested)',
        };
      case 'HAS_FAILS':
      default:
        return {
          bg: '#fee2e2',
          color: '#991b1b',
          text: language === 'te' ? '❌ దిద్దుబాటు అవసరమైన లోపాలు ఉన్నాయి' : '❌ Critical Discrepancies Detected',
        };
    }
  };

  const getOutcomeStyle = (outcome: FindingOutcome) => {
    switch (outcome) {
      case 'PASS':
        return { bg: '#d1fae5', color: '#065f46', label: 'PASS' };
      case 'WARNING':
        return { bg: '#fef3c7', color: '#92400e', label: 'WARNING' };
      case 'NEEDS_MANUAL_REVIEW':
        return { bg: '#ede9fe', color: '#5b21b6', label: 'OFFICER REVIEW' };
      case 'FAIL':
      default:
        return { bg: '#fee2e2', color: '#991b1b', label: 'ACTION NEEDED' };
    }
  };

  const filteredFindings = summary?.findings.filter((f) => {
    if (activeTab === 'ALL') return true;
    return f.outcome === activeTab;
  }) || [];

  return (
    <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '1.5rem', margin: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>
            {language === 'te' ? 'వివరణాత్మక AI పూర్వ-పరిశీలన డాష్‌బోర్డ్' : 'Explainable AI Pre-Screening Findings'}
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#4b5563' }}>
            {language === 'te'
              ? 'దరఖాస్తు ఫారమ్ వివరాలు మరియు అప్‌లోడ్ చేసిన పత్రాల మధ్య స్వయంచాలక నిబంధనల సరిపోలిక'
              : 'Automated explainable verification cross-referencing application data and uploaded document OCR'}
          </p>
        </div>

        <button
          type="button"
          disabled={running}
          onClick={handleRunPrescreening}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            background: running ? '#9ca3af' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          {running
            ? language === 'te' ? 'పరిశీలిస్తోంది...' : 'Running Pre-Screening...'
            : language === 'te' ? 'పూర్వ-పరిశీలన ప్రారంభించు' : 'Run Pre-Screening'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', fontSize: '0.875rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {loading && !summary && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          {language === 'te' ? 'పూర్వ-పరిశీలన ఫలితాలు లోడ్ అవుతున్నాయి...' : 'Loading pre-screening status...'}
        </div>
      )}

      {!loading && !summary && (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '6px', border: '1px dashed #d1d5db' }}>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '0.95rem' }}>
            {language === 'te'
              ? 'ఈ దరఖాస్తుకు ఇంకా పూర్వ-పరిశీలన నిర్వహించబడలేదు. ప్రారంభించడానికి పైన ఉన్న బటన్‌ను క్లిక్ చేయండి.'
              : 'Pre-screening has not been executed yet for this application. Click "Run Pre-Screening" above to evaluate form data and supporting documents.'}
          </p>
        </div>
      )}

      {summary && (
        <div>
          {/* Status Banner */}
          {(() => {
            const badge = getStatusBadge(summary.overallStatus);
            return (
              <div
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '6px',
                  background: badge.bg,
                  color: badge.color,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{badge.text}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                  Avg. OCR Confidence: {(summary.averageConfidence * 100).toFixed(1)}%
                </span>
              </div>
            );
          })()}

          {/* Metrics Overview Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534' }}>{summary.passCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#15803d' }}>{language === 'te' ? 'ఆమోదించబడినవి' : 'Passed Checks'}</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '6px', background: '#fef3c7', border: '1px solid #fde68a', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#92400e' }}>{summary.warningCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#b45309' }}>{language === 'te' ? 'హెచ్చరికలు' : 'Warnings'}</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '6px', background: '#fee2e2', border: '1px solid #fecaca', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991b1b' }}>{summary.failCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>{language === 'te' ? 'దిద్దుబాట్లు' : 'Action Needed'}</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '6px', background: '#ede9fe', border: '1px solid #ddd6fe', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#5b21b6' }}>{summary.manualReviewCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#6d28d9' }}>{language === 'te' ? 'మాన్యువల్ సమీక్ష' : 'Officer Review'}</div>
            </div>
          </div>

          {/* Filter Tabs & OCR Inspector Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['ALL', 'FAIL', 'WARNING', 'NEEDS_MANUAL_REVIEW', 'PASS'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: activeTab === tab ? '#2563eb' : '#f3f4f6',
                    color: activeTab === tab ? '#ffffff' : '#4b5563',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tab === 'ALL' ? (language === 'te' ? 'అన్నీ' : 'All') : tab}
                </button>
              ))}
            </div>

            {summary.extractions && summary.extractions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowOcrInspector(!showOcrInspector)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {showOcrInspector ? 'Hide OCR Extractions' : 'Inspect OCR Extractions'}
              </button>
            )}
          </div>

          {/* OCR Inspector Details Drawer */}
          {showOcrInspector && summary.extractions && (
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1rem', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#1e293b' }}>
                Extracted Document OCR Entities ({summary.extractions.length} documents)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {summary.extractions.map((ext) => (
                  <div key={ext.id} style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>📄 {ext.documentName}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Engine: {ext.engineName} v{ext.engineVersion} • Confidence: {(ext.confidenceScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <pre style={{ margin: 0, background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', overflowX: 'auto' }}>
                      {JSON.stringify(ext.extractedFields, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Findings List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredFindings.map((finding) => {
              const badge = getOutcomeStyle(finding.outcome);

              return (
                <div
                  key={finding.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    borderLeft: `4px solid ${badge.color}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: badge.bg,
                          color: badge.color,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {badge.label}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1f2937' }}>
                        {finding.ruleCode}
                      </span>
                      {finding.fieldKey && (
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>• Field: {finding.fieldKey}</span>
                      )}
                    </div>
                    {finding.confidence && (
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        Confidence: {(finding.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#374151' }}>
                    {finding.explanation}
                  </p>

                  {/* Value Comparison Diff */}
                  {(finding.expectedValue || finding.extractedValue) && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        background: '#f9fafb',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        marginBottom: '0.5rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      {finding.expectedValue && (
                        <div>
                          <strong style={{ color: '#4b5563' }}>Expected / Form: </strong>
                          <span style={{ color: '#111827' }}>{finding.expectedValue}</span>
                        </div>
                      )}
                      {finding.extractedValue && (
                        <div>
                          <strong style={{ color: '#4b5563' }}>Extracted / Document: </strong>
                          <span style={{ color: '#111827' }}>{finding.extractedValue}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {finding.suggestedAction && finding.outcome !== 'PASS' && (
                    <div style={{ fontSize: '0.8rem', color: '#1d4ed8', background: '#eff6ff', padding: '0.4rem 0.75rem', borderRadius: '4px' }}>
                      💡 <strong>{language === 'te' ? 'సూచించిన చర్య: ' : 'Suggested Action: '}</strong>
                      {finding.suggestedAction}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
