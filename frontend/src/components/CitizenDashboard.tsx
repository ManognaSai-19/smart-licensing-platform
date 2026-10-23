import React, { useState, useEffect } from 'react';
import { ApplicationDetail, ApplicationSummary } from '../types/application';
import { applicationApi } from '../services/applicationApi';
import { ApplicationWizard } from './ApplicationWizard';
import { ApplicationDetailView } from './ApplicationDetailView';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Eye,
  RefreshCw,
  Building,
  Calendar,
  ArrowRight,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Quick "Check Status" state
  const [statusSearchRef, setStatusSearchRef] = useState<string>('');
  const [statusSearchResult, setStatusSearchResult] = useState<ApplicationSummary | null>(null);
  const [statusSearchError, setStatusSearchError] = useState<string | null>(null);

  // Wizard & Details Modals
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [wizardApp, setWizardApp] = useState<ApplicationDetail | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);

  // Map to store rejection reasons for quick display
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationApi.getMyApplications();
      setApplications(data);

      // Pre-fetch rejection reasons for any rejected applications
      const rejectedList = data.filter((a) => a.status === 'REJECTED');
      const reasonsMap: Record<number, string> = {};
      for (const item of rejectedList) {
        try {
          const detail = await applicationApi.getApplicationById(item.id);
          if (detail.reviewDecisions && detail.reviewDecisions.length > 0) {
            reasonsMap[item.id] = detail.reviewDecisions[0].reason || 'Criteria mismatch';
          }
        } catch {
          // ignore
        }
      }
      setRejectionReasons(reasonsMap);
    } catch (err) {
      console.warn('Could not load citizen applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleOpenWizard = (appToEdit?: ApplicationDetail) => {
    setWizardApp(appToEdit || null);
    setIsWizardOpen(true);
  };

  const handleEditFromDossier = (app: ApplicationDetail) => {
    setSelectedAppId(null);
    handleOpenWizard(app);
  };

  // Quick Check Status handler
  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusSearchError(null);
    setStatusSearchResult(null);

    const ref = statusSearchRef.trim();
    if (!ref) {
      setStatusSearchError('Please enter an application reference number.');
      return;
    }

    const found = applications.find(
      (a) => a.referenceNumber.toLowerCase() === ref.toLowerCase()
    );

    if (found) {
      setStatusSearchResult(found);
    } else {
      setStatusSearchError(`No application found with reference "${ref}".`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>ACTION REQUIRED</span>
          </span>
        );
      case 'UNDER_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>IN REVIEW</span>
          </span>
        );
      case 'SUBMITTED':
      case 'RESUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>SUBMITTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            <span>DRAFT</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-5">
      {/* SECTION 1: APPLY FOR A LICENSE (HERO ACTION CARD) */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Digital Government Services</span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">Apply for a License</h2>
          <p className="text-xs text-indigo-100 leading-relaxed max-w-xs">
            Apply for driving licenses, municipal trade permits, and certificates with step-by-step guidance.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleOpenWizard()}
              className="w-full py-3 px-4 bg-white text-indigo-900 font-bold rounded-2xl text-xs shadow hover:bg-indigo-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-indigo-700 stroke-[3]" />
              <span>Apply for New License</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: CHECK STATUS (SEARCH CARD) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Search className="w-4 h-4 text-indigo-600" />
          <span>Check Application Status</span>
        </div>

        <form onSubmit={handleCheckStatus} className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={statusSearchRef}
              onChange={(e) => setStatusSearchRef(e.target.value)}
              placeholder="Enter Reference (e.g. APP-20261023-...)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-2xl text-xs shadow-sm transition"
          >
            Check Status
          </button>
        </form>

        {statusSearchError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{statusSearchError}</span>
          </div>
        )}

        {statusSearchResult && (
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-900">
                {statusSearchResult.referenceNumber}
              </span>
              {getStatusBadge(statusSearchResult.status)}
            </div>
            <p className="text-xs font-semibold text-slate-800">{statusSearchResult.serviceName}</p>
            <p className="text-[11px] text-slate-500">
              Department: {statusSearchResult.departmentName} &bull; Applied: {new Date(statusSearchResult.createdAt).toLocaleDateString()}
            </p>

            <button
              type="button"
              onClick={() => setSelectedAppId(statusSearchResult.id)}
              className="w-full mt-2 py-1.5 bg-indigo-600 text-white font-bold text-[11px] rounded-xl hover:bg-indigo-700 transition"
            >
              View Full Status & Timeline →
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: APPLIED TILL NOW (APPLICATION HISTORY) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Applied Till Now</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {applications.length}
            </span>
          </div>

          <button
            type="button"
            onClick={loadApplications}
            disabled={loading}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading && applications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading your applications...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">No applications applied yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Tap the "Apply for a License" card above to submit your first digital application.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((item) => {
              const isRejected = item.status === 'REJECTED';
              const rejectionReason = rejectionReasons[item.id];

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-4 border transition-all ${
                    isRejected
                      ? 'border-rose-300 shadow-md ring-1 ring-rose-200'
                      : 'border-slate-200/80 shadow-sm hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {item.referenceNumber}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Card Title & Info */}
                  <div className="mt-2 space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{item.serviceName}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{item.departmentName}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* PROMINENT REJECTION REASON & FIX OPTION */}
                  {isRejected && (
                    <div className="mt-3 p-3 bg-rose-50/90 border border-rose-200 rounded-2xl space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-rose-900">Why was this rejected?</p>
                          <p className="text-xs text-rose-700 mt-0.5">
                            {rejectionReason || 'Document clarity or verification mismatch identified by reviewing officer.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          const full = await applicationApi.getApplicationById(item.id);
                          handleOpenWizard(full);
                        }}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Fix Application & Resubmit</span>
                      </button>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAppId(item.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Dossier & Timeline</span>
                    </button>

                    {item.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const full = await applicationApi.getApplicationById(item.id);
                          handleOpenWizard(full);
                        }}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
                      >
                        Continue Draft →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guided Wizard Modal */}
      {isWizardOpen && (
        <ApplicationWizard
          existingApplication={wizardApp}
          onClose={() => {
            setIsWizardOpen(false);
            setWizardApp(null);
            loadApplications();
          }}
          onApplicationCompleted={() => {
            setIsWizardOpen(false);
            setWizardApp(null);
            loadApplications();
          }}
        />
      )}

      {/* Application Dossier Detail View */}
      {selectedAppId && (
        <ApplicationDetailView
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onEditApplication={handleEditFromDossier}
        />
      )}
    </div>
  );
};
