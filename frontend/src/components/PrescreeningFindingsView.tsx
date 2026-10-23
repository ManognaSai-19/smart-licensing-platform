import React, { useState, useEffect } from 'react';
import { PrescreeningSummary, FindingOutcome } from '../types/prescreening';
import { prescreeningApi } from '../services/prescreeningApi';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
  RefreshCw,
  Eye,
  FileText,
  ShieldCheck,
} from 'lucide-react';

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
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          text: language === 'te' ? '✓ పూర్వ-పరిశీలన ఆమోదించబడింది (సమర్పణకు సిద్ధం)' : '✓ Pre-Screening Cleared (Ready for Submission)',
          icon: CheckCircle2,
        };
      case 'NEEDS_MANUAL_REVIEW':
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          text: language === 'te' ? '🔍 అధికారి మాన్యువల్ పరిశీలనకు నిర్దేశించబడింది (జరిమానా లేదు)' : '🔍 Routed for Officer Manual Inspection (No Penalty)',
          icon: Search,
        };
      case 'HAS_WARNINGS':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          text: language === 'te' ? '⚠️ చిన్నపాటి వ్యత్యాసాలు గమనించబడ్డాయి (సమీక్ష సిఫార్సు)' : '⚠️ Minor Variations Noted (Review Suggested)',
          icon: AlertTriangle,
        };
      case 'HAS_FAILS':
      default:
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          text: language === 'te' ? '❌ దిద్దుబాటు అవసరమైన లోపాలు ఉన్నాయి' : '❌ Critical Discrepancies Detected (Fix Required)',
          icon: AlertCircle,
        };
    }
  };

  const getOutcomeBadge = (outcome: FindingOutcome) => {
    switch (outcome) {
      case 'PASS':
        return {
          cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: language === 'te' ? 'ఆమోదం' : 'PASS',
        };
      case 'WARNING':
        return {
          cls: 'bg-amber-50 text-amber-800 border-amber-200',
          label: language === 'te' ? 'హెచ్చరిక' : 'WARNING',
        };
      case 'NEEDS_MANUAL_REVIEW':
        return {
          cls: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          label: language === 'te' ? 'అధికారి సమీక్ష' : 'OFFICER REVIEW',
        };
      case 'FAIL':
      default:
        return {
          cls: 'bg-rose-50 text-rose-800 border-rose-200',
          label: language === 'te' ? 'చర్య అవసరం' : 'ACTION NEEDED',
        };
    }
  };

  const filteredFindings =
    summary?.findings.filter((f) => {
      if (activeTab === 'ALL') return true;
      return f.outcome === activeTab;
    }) || [];

  return (
    <div className="w-full space-y-5 animate-in fade-in">
      {/* HEADER SECTION */}
      <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-[#101828] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2563EB]" />
            <span>
              {language === 'te'
                ? 'వివరణాత్మక AI పూర్వ-పరిశీలన ఫలితాలు'
                : 'Explainable AI Pre-Screening Findings'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'te'
              ? 'ఫారమ్ వివరాలు మరియు అప్‌లోడ్ చేసిన పత్రాల మధ్య స్వయంచాలక నిబంధనల సరిపోలిక'
              : 'Cross-verifies application form fields against document OCR to prevent avoidable rejections'}
          </p>
        </div>

        <button
          type="button"
          disabled={running}
          onClick={handleRunPrescreening}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto ${
            running
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs'
          }`}
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{language === 'te' ? 'పరిశీలిస్తోంది...' : 'Running Verification...'}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>
                {summary
                  ? language === 'te'
                    ? 'మళ్ళీ సరిచూడు'
                    : 'Re-Run Pre-Screening'
                  : language === 'te'
                  ? 'పూర్వ-పరిశీలన ప్రారంభించు'
                  : 'Run Pre-Screening'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* ERROR FEEDBACK */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && !summary && (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">
            {language === 'te' ? 'పూర్వ-పరిశీలన ఫలితాలు లోడ్ అవుతున్నాయి...' : 'Loading verification findings...'}
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !summary && (
        <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-slate-300 space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-[#101828]">Pre-Screening Not Run Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Click "Run Pre-Screening" above to automatically inspect uploaded documents and compare names, dates of birth, and identity numbers against your form entry.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunPrescreening}
            className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8] transition shadow-xs"
          >
            Run Pre-Screening Now
          </button>
        </div>
      )}

      {/* PRE-SCREENING RESULTS */}
      {summary && (
        <div className="space-y-4">
          {/* Status Banner */}
          {(() => {
            const badge = getStatusBadge(summary.overallStatus);
            const Icon = badge.icon;
            return (
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${badge.bg}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold">{badge.text}</span>
                </div>
                <span className="text-xs font-mono font-bold bg-white/60 px-3 py-1 rounded-xl self-start sm:self-auto border border-current/20">
                  Avg. OCR Confidence: {(summary.averageConfidence * 100).toFixed(1)}%
                </span>
              </div>
            );
          })()}

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
              <div className="text-xl font-extrabold text-[#15803D]">{summary.passCount}</div>
              <div className="text-[11px] font-bold text-emerald-800 mt-0.5">
                {language === 'te' ? 'ఆమోదించినవి' : 'Passed Checks'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
              <div className="text-xl font-extrabold text-[#B45309]">{summary.warningCount}</div>
              <div className="text-[11px] font-bold text-amber-800 mt-0.5">
                {language === 'te' ? 'హెచ్చరికలు' : 'Advisory Warnings'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-center">
              <div className="text-xl font-extrabold text-rose-700">{summary.failCount}</div>
              <div className="text-[11px] font-bold text-rose-800 mt-0.5">
                {language === 'te' ? 'దిద్దుబాట్లు' : 'Action Needed'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-center">
              <div className="text-xl font-extrabold text-indigo-700">{summary.manualReviewCount}</div>
              <div className="text-[11px] font-bold text-indigo-800 mt-0.5">
                {language === 'te' ? 'అధికారి సమీక్ష' : 'Officer Review'}
              </div>
            </div>
          </div>

          {/* Filter Pills & OCR Inspector Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {(
                [
                  { key: 'ALL', labelEn: 'All Checks', labelTe: 'అన్నీ' },
                  { key: 'FAIL', labelEn: 'Action Needed', labelTe: 'లోపాలు' },
                  { key: 'WARNING', labelEn: 'Warnings', labelTe: 'హెచ్చరికలు' },
                  { key: 'NEEDS_MANUAL_REVIEW', labelEn: 'Officer Review', labelTe: 'మాన్యువల్' },
                  { key: 'PASS', labelEn: 'Passed', labelTe: 'ఆమోదం' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    activeTab === tab.key
                      ? 'bg-[#101828] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {language === 'te' ? tab.labelTe : tab.labelEn}
                </button>
              ))}
            </div>

            {summary.extractions && summary.extractions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowOcrInspector(!showOcrInspector)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 hover:bg-slate-100 text-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{showOcrInspector ? 'Hide OCR Inspector' : 'Inspect OCR Entities'}</span>
              </button>
            )}
          </div>

          {/* OCR Entities Inspector Drawer */}
          {showOcrInspector && summary.extractions && (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#101828] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2563EB]" />
                <span>Extracted Document Entities ({summary.extractions.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {summary.extractions.map((ext, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-[#101828]">{ext.documentName || 'Document'}</div>
                    <div className="text-slate-500 text-[11px]">
                      Engine: <span className="font-mono text-slate-700">{ext.engineName}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Confidence: <span className="font-mono font-bold text-[#2563EB]">{(ext.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Raw OCR Extract:</span>
                      <p className="text-[11px] text-slate-600 line-clamp-2 italic font-mono bg-slate-50 p-1.5 rounded mt-1">
                        {ext.rawText || 'No text extracted'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Findings List */}
          <div className="space-y-3">
            {filteredFindings.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                No rule findings match this filter.
              </div>
            ) : (
              filteredFindings.map((finding) => {
                const outcomeBadge = getOutcomeBadge(finding.outcome);

                return (
                  <div
                    key={finding.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#101828]">
                          {finding.documentName || finding.fieldKey || 'Rule Check'}
                        </span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {finding.ruleCode}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border self-start sm:self-auto ${outcomeBadge.cls}`}
                      >
                        {outcomeBadge.label}
                      </span>
                    </div>

                    {/* Compare Values Row */}
                    {(finding.expectedValue || finding.extractedValue) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">
                            Entered in Form:
                          </span>
                          <span className="font-mono font-bold text-[#101828]">
                            {finding.expectedValue || '(blank)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">
                            Extracted from Document:
                          </span>
                          <span className="font-mono font-bold text-[#2563EB]">
                            {finding.extractedValue || '(none)'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {finding.explanation}
                    </p>

                    {/* Advice / Fix Recommendation */}
                    {finding.suggestedAction && (
                      <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-[#B45309] flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          <strong>Recommended action:</strong> {finding.suggestedAction}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
