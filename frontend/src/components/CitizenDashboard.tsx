import React, { useState, useEffect } from 'react';
import { ApplicationDetail, ApplicationSummary } from '../types/application';
import { applicationApi } from '../services/applicationApi';
import { ApplicationWizard } from './ApplicationWizard';
import { ApplicationDetailView } from './ApplicationDetailView';
import { VoiceAssistantModal } from './VoiceAssistantModal';
import { useAuth } from '../context/AuthContext';
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
  Sparkles,
  Mic,
  Compass,
} from 'lucide-react';

interface CitizenDashboardProps {
  onNavigate?: (navKey: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const userName = user?.fullName || 'Sai Manogna';

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

  // General Voice Assistant Modal
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);

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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>ACTION REQUIRED</span>
          </span>
        );
      case 'UNDER_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/30">
            <Clock className="w-3.5 h-3.5 text-[#B45309]" />
            <span>REVIEW REQUIRED</span>
          </span>
        );
      case 'SUBMITTED':
      case 'RESUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAF2FF] text-[#2563EB] border border-[#cfe0fc]">
            <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>SUBMITTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-[#101828]/70">
            <span>DRAFT</span>
          </span>
        );
    }
  };

  // Activity Counts from real backend data
  const inProgressCount = applications.filter(
    (a) => a.status === 'SUBMITTED' || a.status === 'RESUBMITTED' || a.status === 'UNDER_VERIFICATION'
  ).length;
  const needsActionCount = applications.filter((a) => a.status === 'REJECTED').length;
  const completedCount = applications.filter((a) => a.status === 'APPROVED').length;

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto pb-8">
      {/* SCREEN 5 GREETING BANNER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#101828] tracking-tight">
            Good morning, {userName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            What would you like to do today?
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenWizard()}
          className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Application</span>
        </button>
      </div>

      {/* SCREEN 5: 3 QUICK ACTION CARDS (MIDDLE ALIGNED) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Action 1: New Application */}
        <button
          type="button"
          onClick={() => handleOpenWizard()}
          className="p-6 rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center text-center group min-h-[175px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
            <Plus className="w-7 h-7 text-white stroke-[2.5]" />
          </div>
          <h4 className="text-base font-extrabold tracking-tight">New Application</h4>
          <p className="text-xs text-[#EAF2FF] mt-1 font-medium">Start a service request</p>
        </button>

        {/* Action 2: Explore Services */}
        <button
          type="button"
          onClick={() => (onNavigate ? onNavigate('explore-services') : null)}
          className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col items-center justify-center text-center group min-h-[175px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
            <Compass className="w-7 h-7" />
          </div>
          <h4 className="text-base font-extrabold text-[#101828] tracking-tight">Explore Services</h4>
          <p className="text-xs text-slate-500 mt-1 font-medium">View all available services</p>
        </button>

        {/* Action 3: My Applications */}
        <a
          href="#recent-applications"
          className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col items-center justify-center text-center group min-h-[175px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
            <FileText className="w-7 h-7" />
          </div>
          <h4 className="text-base font-extrabold text-[#101828] tracking-tight">My Applications</h4>
          <p className="text-xs text-slate-500 mt-1 font-medium">Track your requests</p>
        </a>
      </div>

      {/* SCREEN 5: YOUR ACTIVITY SUMMARY & TALK TO ASSISTANT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Your Activity KPI Cards */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#101828]">Your Activity</h3>
            <span className="text-[11px] font-semibold text-slate-400">Real-time status</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* In Progress */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-3xl font-extrabold text-[#2563EB] block">
                {inProgressCount}
              </span>
              <span className="text-xs font-bold text-[#101828] block">
                In Progress
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block">Under verification</span>
            </div>

            {/* Needs Action */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-3xl font-extrabold text-[#B45309] block">
                {needsActionCount}
              </span>
              <span className="text-xs font-bold text-[#B45309] block">
                Needs Action
              </span>
              <span className="text-[10px] text-amber-700/80 hidden sm:block">Corrections needed</span>
            </div>

            {/* Completed */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-3xl font-extrabold text-[#15803D] block">
                {completedCount}
              </span>
              <span className="text-xs font-bold text-[#15803D] block">
                Completed
              </span>
              <span className="text-[10px] text-emerald-700/80 hidden sm:block">Approved licenses</span>
            </div>
          </div>
        </div>

        {/* Right: Talk to Assistant Card (Middle Aligned) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#101828] via-[#162544] to-[#2563EB] rounded-3xl p-6 text-white shadow-md flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
            <Mic className="w-7 h-7 text-[#EAF2FF]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Talk to Assistant</h4>
            <p className="text-xs text-[#EAF2FF]/80 mt-0.5 font-medium">Telugu & English voice help</p>
          </div>

          <p className="text-xs text-[#EAF2FF]/90 leading-relaxed max-w-xs">
            Need help? Ask your questions using voice or text for step-by-step guidance.
          </p>

          <button
            type="button"
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="w-full py-3 px-4 bg-white text-[#2563EB] hover:bg-[#EAF2FF] font-bold rounded-2xl text-xs shadow-sm transition flex items-center justify-center gap-2 mt-1"
          >
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span>Start Talking</span>
          </button>
        </div>
      </div>

      {/* QUICK STATUS LOOKUP CARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-[#101828] font-bold text-sm">
          <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <span>Check Application Status</span>
        </div>

        <form onSubmit={handleCheckStatus} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={statusSearchRef}
                onChange={(e) => setStatusSearchRef(e.target.value)}
                placeholder="Enter Reference (e.g. DRL-2026-001 or APP-20261023-...)"
                className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-mono text-[#101828] focus:ring-2 focus:ring-[#2563EB] focus:bg-white focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#101828] hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow-sm transition whitespace-nowrap flex items-center justify-center gap-2"
            >
              <span>Check Status</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/70" />
            </button>
          </div>
        </form>

        {statusSearchError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{statusSearchError}</span>
          </div>
        )}

        {statusSearchResult && (
          <div className="p-5 bg-[#EAF2FF] border border-[#cfe0fc] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#101828]">
                {statusSearchResult.referenceNumber}
              </span>
              {getStatusBadge(statusSearchResult.status)}
            </div>
            <p className="text-sm font-bold text-[#101828]">{statusSearchResult.serviceName}</p>
            <p className="text-xs text-[#101828]/70">
              Department: {statusSearchResult.departmentName} &bull; Applied: {new Date(statusSearchResult.createdAt).toLocaleDateString()}
            </p>

            <button
              type="button"
              onClick={() => setSelectedAppId(statusSearchResult.id)}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>View Full Status & Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* SCREEN 5: RECENT APPLICATIONS LIST / TABLE */}
      <div id="recent-applications" className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#101828]">Recent Applications</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#2563EB]">
              {applications.length}
            </span>
          </div>

          <button
            type="button"
            onClick={loadApplications}
            disabled={loading}
            className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold inline-flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading && applications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-[#101828]">No applications applied yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Tap the "New Application" button above to submit your first digital application.
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
                  className={`p-5 rounded-2xl border transition-all ${
                    isRejected
                      ? 'border-rose-300 bg-rose-50/20 shadow-xs'
                      : 'border-slate-200 bg-[#F8FAFC]/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#2563EB]">
                          {item.referenceNumber}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                      <h4 className="text-sm font-bold text-[#101828]">{item.serviceName}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.departmentName}</span>
                        </span>
                        <span>&bull;</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center pt-2 sm:pt-0 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedAppId(item.id)}
                        className="px-4 py-2 bg-white border border-slate-200 hover:border-[#2563EB] text-[#2563EB] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      {item.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={async () => {
                            const full = await applicationApi.getApplicationById(item.id);
                            handleOpenWizard(full);
                          }}
                          className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8] transition flex items-center gap-1"
                        >
                          <span>Continue Draft</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PROMINENT REJECTION REASON & 1-TAP RESUBMIT */}
                  {isRejected && (
                    <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
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

      {/* Application Dossier Detail View (Screen 11) */}
      {selectedAppId && (
        <ApplicationDetailView
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onEditApplication={handleEditFromDossier}
        />
      )}

      {/* General Voice Assistant Modal */}
      {isVoiceAssistantOpen && (
        <VoiceAssistantModal
          isOpen={isVoiceAssistantOpen}
          serviceCode="general"
          serviceName="Citizen Licensing Services"
          onClose={() => setIsVoiceAssistantOpen(false)}
          onFormUpdate={() => {}}
        />
      )}
    </div>
  );
};

