import React, { useState, useEffect } from 'react';
import { ApplicationDetail } from '../types/application';
import { applicationApi } from '../services/applicationApi';
import { StatusBadge } from './ui/designSystem';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Building,
  X,
  RefreshCw,
  Award,
  Download,
  User,
  ArrowRight,
} from 'lucide-react';

interface ApplicationDetailViewProps {
  applicationId: number;
  onClose: () => void;
  onEditApplication?: (app: ApplicationDetail) => void;
}

export const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({
  applicationId,
  onClose,
  onEditApplication,
}) => {
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'details' | 'timeline' | 'certificate'>('details');

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationApi.getApplicationById(applicationId);
      setApp(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [applicationId]);

  if (!applicationId) return null;

  const getTimelineStepIcon = (toStatus: string) => {
    switch (toStatus) {
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-white" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-white" />;
      case 'UNDER_VERIFICATION':
        return <Clock className="w-4 h-4 text-white" />;
      case 'RESUBMITTED':
        return <RotateCcw className="w-4 h-4 text-white" />;
      case 'SUBMITTED':
      default:
        return <FileText className="w-4 h-4 text-white" />;
    }
  };

  const getTimelineStepColor = (toStatus: string) => {
    switch (toStatus) {
      case 'APPROVED':
        return 'bg-[#15803D] ring-4 ring-emerald-100';
      case 'REJECTED':
        return 'bg-[#B91C1C] ring-4 ring-rose-100';
      case 'UNDER_VERIFICATION':
        return 'bg-[#B45309] ring-4 ring-amber-100';
      case 'RESUBMITTED':
      case 'SUBMITTED':
      default:
        return 'bg-[#2563EB] ring-4 ring-blue-100';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#101828] via-[#162544] to-[#1E3A8A] text-white flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                {app?.referenceNumber || `APP #${applicationId}`}
              </span>
              {app && <StatusBadge status={app.status} />}
            </div>
            <h2 id="dossier-modal-title" className="text-lg sm:text-xl font-black text-white tracking-tight">
              {app?.serviceName || 'Application Dossier'}
            </h2>
            <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-blue-300" />
                <span>{app?.departmentName}</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{app?.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}</span>
              </span>
              {app?.citizenName && (
                <>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.citizenName}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDetails}
              title="Refresh dossier"
              aria-label="Refresh dossier"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close dossier"
              aria-label="Close dossier"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('details')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeSection === 'details'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Form & Payload</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('timeline')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeSection === 'timeline'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Tracking & Timeline</span>
            {app?.statusHistory && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {app.statusHistory.length}
              </span>
            )}
          </button>

          {app?.status === 'APPROVED' && (
            <button
              type="button"
              onClick={() => setActiveSection('certificate')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeSection === 'certificate'
                  ? 'border-[#15803D] text-[#15803D]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Award className="w-4 h-4 text-[#15803D]" />
              <span>Digital Certificate</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-[#B91C1C] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && !app ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Loading application dossier...</span>
            </div>
          ) : app ? (
            <>
              {/* REJECTION REASON & 1-TAP RESUBMISSION */}
              {app.status === 'REJECTED' && (
                <div className="p-5 bg-rose-50/80 border border-rose-200 rounded-3xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-100 text-[#B91C1C] shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-[#B91C1C]">
                        Officer Adjudication Feedback: Correction Required
                      </h3>
                      <p className="text-xs text-[#B91C1C]">
                        Discrepancy Justification:{' '}
                        <span className="font-bold underline">
                          {app.reviewDecisions && app.reviewDecisions[0]?.reason
                            ? app.reviewDecisions[0].reason
                            : 'Documentation or verification criteria mismatch'}
                        </span>
                      </p>
                      {app.reviewDecisions && app.reviewDecisions[0]?.notes && (
                        <p className="text-xs text-rose-800 italic bg-white/70 p-2.5 rounded-xl border border-rose-200 mt-2">
                          Reviewer Instructions: "{app.reviewDecisions[0].notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {onEditApplication && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onEditApplication(app)}
                        className="px-5 py-2.5 bg-[#B91C1C] hover:bg-rose-800 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resolve Discrepancy & Resubmit</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DRAFT STATE NOTICE */}
              {app.status === 'DRAFT' && onEditApplication && (
                <div className="p-4 bg-[#EAF2FF] border border-[#cfe0fc] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#101828]">This application is currently in Draft state.</p>
                    <p className="text-xs text-[#64748B]">You can update fields, upload required documents, run pre-screening, and submit.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditApplication(app)}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow-xs transition whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <span>Continue Application</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* SECTION 1: FORM & PAYLOAD DETAILS */}
              {activeSection === 'details' && (
                <div className="space-y-6">
                  {/* Dynamic Form Data Grid */}
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#101828] mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#2563EB]" />
                      <span>Submitted Form Payload</span>
                    </h3>
                    {app.formData && Object.keys(app.formData).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(app.formData).map(([key, value]) => (
                          <div
                            key={key}
                            className="p-3.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl"
                          >
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                              {key}
                            </span>
                            <span className="text-xs font-bold text-[#0F172A] break-words mt-1 block">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No form fields filled yet.</p>
                    )}
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Documents</span>
                      <span className="text-base font-extrabold text-[#101828]">{app.documentCount} Uploaded</span>
                    </div>
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Pre-Screening</span>
                      <span className="text-base font-extrabold text-[#2563EB]">{app.findingCount} Findings</span>
                    </div>
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Applicant</span>
                      <span className="text-xs font-extrabold text-[#101828] truncate block">{app.citizenName}</span>
                    </div>
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Language</span>
                      <span className="text-xs font-extrabold text-[#101828] uppercase">{app.languagePreference || 'EN'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: CHRONOLOGICAL TRACKING TIMELINE */}
              {activeSection === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#101828] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#2563EB]" />
                        <span>Chronological Lifecycle Audit Timeline</span>
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Immutable record of all state transitions, reviewer actors, and adjudication timestamps
                      </p>
                    </div>
                  </div>

                  {app.statusHistory && app.statusHistory.length > 0 ? (
                    <div className="relative border-l-2 border-slate-200 ml-5 pl-7 space-y-6 py-2">
                      {app.statusHistory.map((step, idx) => (
                        <div key={step.id || idx} className="relative">
                          {/* Timeline node icon */}
                          <div
                            className={`absolute -left-[43px] top-0 w-8 h-8 rounded-full flex items-center justify-center shadow-xs ${getTimelineStepColor(
                              step.toStatus
                            )}`}
                          >
                            {getTimelineStepIcon(step.toStatus)}
                          </div>

                          {/* Timeline Card */}
                          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-[#101828]">
                                  {step.fromStatus ? `${step.fromStatus} → ` : ''}
                                  {step.toStatus}
                                </span>
                                <StatusBadge status={step.toStatus} />
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">
                                {new Date(step.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <p className="text-xs text-[#64748B]">
                              Recorded by Actor:{' '}
                              <span className="font-bold text-[#0F172A]">{step.changedByName || 'System Automation'}</span>
                            </p>

                            {step.notes && (
                              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-[#0F172A] italic">
                                "{step.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200 text-xs text-slate-400">
                      No state transitions logged yet.
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: DIGITAL CERTIFICATE VIEW */}
              {activeSection === 'certificate' && app.status === 'APPROVED' && (
                <div className="p-8 bg-gradient-to-b from-[#F8FAFC] to-white rounded-3xl border-2 border-emerald-300 shadow-sm space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto shadow-xs border border-emerald-300">
                    <Award className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#15803D] uppercase block">
                      Government of Telangana &bull; Andhra Pradesh &bull; Official Digital License
                    </span>
                    <h3 className="text-2xl font-black text-[#101828] mt-1.5">
                      {app.serviceName}
                    </h3>
                    <p className="text-xs font-mono font-bold text-[#2563EB] mt-1">
                      License ID: {app.referenceNumber}
                    </p>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2.5 shadow-2xs">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-400">Beneficiary:</span>
                      <span className="font-bold text-[#0F172A]">{app.citizenName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-400">Issuing Department:</span>
                      <span className="font-bold text-[#0F172A]">{app.departmentName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-400">Adjudication Status:</span>
                      <span className="font-black text-[#15803D]">VERIFIED & APPROVED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date of Issuance:</span>
                      <span className="font-bold text-[#0F172A]">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-6 py-3 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl text-xs shadow-md transition inline-flex items-center gap-2 active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download / Print Digital License</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#101828] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
