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
  const [activeSection, setActiveSection] = useState<'details' | 'timeline'>('details');

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>ACTION REQUIRED / REJECTED</span>
          </span>
        );
      case 'UNDER_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>UNDER VERIFICATION</span>
          </span>
        );
      case 'SUBMITTED':
      case 'RESUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            <span>DRAFT</span>
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-indigo-400">
                {app?.referenceNumber || `APP #${applicationId}`}
              </span>
              {app && getStatusBadge(app.status)}
            </div>
            <h2 id="dossier-modal-title" className="text-xl font-bold text-white">
              {app?.serviceName || 'Application Dossier'}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <Building className="w-3.5 h-3.5" />
              <span>{app?.departmentName}</span>
              <span>&bull;</span>
              <Calendar className="w-3.5 h-3.5" />
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
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close dossier"
              aria-label="Close dossier"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-6">
          <button
            type="button"
            onClick={() => setActiveSection('details')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeSection === 'details'
                ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Application Dossier & Data
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('timeline')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeSection === 'timeline'
                ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lifecycle Audit Timeline ({app?.statusHistory?.length || 0})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium">Loading application dossier...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          ) : app ? (
            <>
              {/* Rejection / Resubmission Notice */}
              {app.status === 'REJECTED' && (
                <div className="p-5 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-900">
                        Officer Adjudication Feedback: Application Rejected
                      </h4>
                      <p className="text-xs text-red-700 mt-1">
                        Reason: <span className="font-semibold">{app.reviewDecisions[0]?.reason || 'Discrepancy in documentation or criteria'}</span>
                      </p>
                      {app.reviewDecisions[0]?.notes && (
                        <p className="text-xs text-red-600 italic mt-0.5">
                          Officer Notes: "{app.reviewDecisions[0].notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {onEditApplication && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onEditApplication(app)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs shadow transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Update Fields & Resubmit</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Draft Continue Notice */}
              {app.status === 'DRAFT' && onEditApplication && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-indigo-900">This application is in Draft state.</p>
                    <p className="text-xs text-indigo-700">You can edit fields, attach documents, run pre-screening, and submit.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditApplication(app)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow transition-colors"
                  >
                    Continue Draft →
                  </button>
                </div>
              )}

              {activeSection === 'details' ? (
                <div className="space-y-6">
                  {/* Dynamic Form Data */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Submitted Form Payload</span>
                    </h4>
                    {app.formData && Object.keys(app.formData).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(app.formData).map(([key, value]) => (
                          <div
                            key={key}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                          >
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
                              {key}
                            </span>
                            <span className="text-sm font-semibold text-slate-800 break-words mt-0.5 block">
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
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-400 uppercase block">Documents</span>
                      <span className="text-base font-bold text-slate-800">{app.documentCount} Uploaded</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-400 uppercase block">Pre-Screening</span>
                      <span className="text-base font-bold text-indigo-600">{app.findingCount} Findings</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-400 uppercase block">Applicant</span>
                      <span className="text-sm font-bold text-slate-800 truncate block">{app.citizenName}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-400 uppercase block">Language</span>
                      <span className="text-sm font-bold text-slate-800 uppercase">{app.languagePreference || 'EN'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Lifecycle Audit History Timeline */
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Application State Transitions & Audit Trail</span>
                  </h4>
                  {app.statusHistory && app.statusHistory.length > 0 ? (
                    <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                      {app.statusHistory.map((step, idx) => (
                        <div key={step.id || idx} className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow"></div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {step.fromStatus ? `${step.fromStatus} → ` : ''}{step.toStatus}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(step.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                              Actor: <span className="font-semibold">{step.changedByName}</span>
                            </p>
                            {step.notes && (
                              <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
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
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
