import React, { useState, useEffect } from 'react';
import { ApplicationDetail } from '../types/application';
import { applicationApi } from '../services/applicationApi';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>ACTION REQUIRED / REJECTED</span>
          </span>
        );
      case 'UNDER_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-[#B45309] border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-[#B45309]" />
            <span>UNDER VERIFICATION</span>
          </span>
        );
      case 'SUBMITTED':
      case 'RESUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#EAF2FF] text-[#2563EB] border border-[#cfe0fc]">
            <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <span>DRAFT</span>
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
    >
      <div className="bg-white sm:rounded-3xl shadow-2xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 bg-[#101828] text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-blue-300 bg-white/10 px-2 py-0.5 rounded">
                {app?.referenceNumber || `APP #${applicationId}`}
              </span>
              {app && getStatusBadge(app.status)}
            </div>
            <h2 id="dossier-modal-title" className="text-xl font-extrabold text-white">
              {app?.serviceName || 'Application Dossier'}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>{app?.departmentName}</span>
              <span>&bull;</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {app?.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDetails}
              title="Refresh dossier"
              aria-label="Refresh dossier"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close dossier"
              aria-label="Close dossier"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-[#F8FAFC] text-xs font-bold px-6 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSection('details')}
            className={`py-3.5 px-4 border-b-2 transition whitespace-nowrap ${
              activeSection === 'details'
                ? 'border-[#2563EB] text-[#2563EB] bg-white font-extrabold'
                : 'border-transparent text-slate-500 hover:text-[#101828]'
            }`}
          >
            Application Dossier & Data
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('timeline')}
            className={`py-3.5 px-4 border-b-2 transition whitespace-nowrap ${
              activeSection === 'timeline'
                ? 'border-[#2563EB] text-[#2563EB] bg-white font-extrabold'
                : 'border-transparent text-slate-500 hover:text-[#101828]'
            }`}
          >
            Lifecycle Timeline ({app?.statusHistory?.length || 0})
          </button>
          {app?.status === 'APPROVED' && (
            <button
              type="button"
              onClick={() => setActiveSection('certificate')}
              className={`py-3.5 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                activeSection === 'certificate'
                  ? 'border-[#15803D] text-[#15803D] bg-white font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-[#101828]'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Official Digital Certificate</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading application dossier...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
              {error}
            </div>
          ) : app ? (
            <>
              {/* REJECTION REASON & 1-TAP RESUBMISSION */}
              {app.status === 'REJECTED' && (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-extrabold text-rose-900">
                        Officer Adjudication Feedback: Application Rejected
                      </h4>
                      <p className="text-xs text-rose-700 mt-1">
                        Specific Reason: <span className="font-bold underline">{app.reviewDecisions[0]?.reason || 'Discrepancy in documentation or criteria'}</span>
                      </p>
                      {app.reviewDecisions[0]?.notes && (
                        <p className="text-xs text-rose-600 italic mt-1 bg-white/60 p-2 rounded-lg border border-rose-200">
                          Officer Instructions: "{app.reviewDecisions[0].notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {onEditApplication && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onEditApplication(app)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resolve Discrepancy & Resubmit</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DRAFT NOTIFICATION */}
              {app.status === 'DRAFT' && onEditApplication && (
                <div className="p-4 bg-[#EAF2FF] border border-[#cfe0fc] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#101828]">This application is in Draft state.</p>
                    <p className="text-xs text-slate-600">You can edit fields, attach documents, run pre-screening, and submit.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditApplication(app)}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow transition whitespace-nowrap self-start sm:self-auto"
                  >
                    Continue Draft →
                  </button>
                </div>
              )}

              {activeSection === 'details' ? (
                <div className="space-y-6">
                  {/* Dynamic Form Data */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#101828] mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#2563EB]" />
                      <span>Submitted Form Payload</span>
                    </h4>
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
                            <span className="text-sm font-bold text-[#101828] break-words mt-1 block">
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
                    <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Documents</span>
                      <span className="text-base font-extrabold text-[#101828]">{app.documentCount} Uploaded</span>
                    </div>
                    <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Pre-Screening</span>
                      <span className="text-base font-extrabold text-[#2563EB]">{app.findingCount} Findings</span>
                    </div>
                    <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Applicant</span>
                      <span className="text-sm font-extrabold text-[#101828] truncate block">{app.citizenName}</span>
                    </div>
                    <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Language</span>
                      <span className="text-sm font-extrabold text-[#101828] uppercase">{app.languagePreference || 'EN'}</span>
                    </div>
                  </div>
                </div>
              ) : activeSection === 'timeline' ? (
                /* Lifecycle Audit History Timeline */
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#101828] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2563EB]" />
                    <span>Application State Transitions & Chronological Timeline</span>
                  </h4>
                  {app.statusHistory && app.statusHistory.length > 0 ? (
                    <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                      {app.statusHistory.map((step, idx) => (
                        <div key={step.id || idx} className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white shadow-xs" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-extrabold text-[#101828]">
                                {step.fromStatus ? `${step.fromStatus} → ` : ''}{step.toStatus}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(step.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                              Actor: <span className="font-bold text-[#101828]">{step.changedByName}</span>
                            </p>
                            {step.notes && (
                              <p className="text-xs text-slate-600 italic bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200">
                                "{step.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No transition history logged yet.</p>
                  )}
                </div>
              ) : (
                /* Official Digital Certificate View */
                <div className="p-6 bg-gradient-to-b from-[#F8FAFC] to-white rounded-3xl border-2 border-emerald-300 shadow-sm space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto shadow-xs border border-emerald-300">
                    <Award className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest text-[#15803D] uppercase">
                      Government of Telangana / Andhra Pradesh &bull; Official Digital License
                    </span>
                    <h3 className="text-2xl font-black text-[#101828] mt-1">
                      {app.serviceName}
                    </h3>
                    <p className="text-xs font-mono font-bold text-[#2563EB] mt-1">
                      License ID: {app.referenceNumber}
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Beneficiary:</span>
                      <span className="font-bold text-[#101828]">{app.citizenName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issuing Department:</span>
                      <span className="font-bold text-[#101828]">{app.departmentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-extrabold text-[#15803D]">VERIFIED & APPROVED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issue Date:</span>
                      <span className="font-bold text-[#101828]">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl text-xs shadow transition inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download / Print Digital Certificate</span>
                  </button>
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
            className="px-5 py-2.5 bg-[#101828] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
