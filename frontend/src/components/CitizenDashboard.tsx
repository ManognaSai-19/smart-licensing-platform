import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApplicationDetail, ApplicationSummary } from '../types/application';
import { applicationApi } from '../services/applicationApi';
import { ApplicationWizard } from './ApplicationWizard';
import { ApplicationDetailView } from './ApplicationDetailView';
import { AuthModal } from './AuthModal';
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
  ShieldCheck,
  Building,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [wizardApp, setWizardApp] = useState<ApplicationDetail | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);

  const loadApplications = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await applicationApi.getMyApplications();
      setApplications(data);
    } catch (err) {
      console.warn('Could not load citizen applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
    }
  }, [isAuthenticated]);

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchesStatus =
      statusFilter === 'ALL' || app.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      app.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const totalApps = applications.length;
  const draftApps = applications.filter((a) => a.status === 'DRAFT').length;
  const pendingApps = applications.filter(
    (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_VERIFICATION' || a.status === 'RESUBMITTED'
  ).length;
  const approvedApps = applications.filter((a) => a.status === 'APPROVED').length;
  const rejectedApps = applications.filter((a) => a.status === 'REJECTED').length;

  const handleOpenWizard = (appToEdit?: ApplicationDetail) => {
    setWizardApp(appToEdit || null);
    setIsWizardOpen(true);
  };

  const handleEditFromDossier = (app: ApplicationDetail) => {
    setSelectedAppId(null);
    handleOpenWizard(app);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>REJECTED</span>
          </span>
        );
      case 'UNDER_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>VERIFYING</span>
          </span>
        );
      case 'SUBMITTED':
      case 'RESUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <Clock className="w-3 h-3 text-indigo-600" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <span>DRAFT</span>
          </span>
        );
    }
  };

  // If citizen is NOT logged in: Show accessible landing & login trigger
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        {/* Guest Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Citizen Access Portal</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Manage Your Digital Licenses & Applications
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sign in to your citizen account to start new digital applications with hands-free voice assistance, view pre-screening verification findings, upload secure documents, and track approval status in real-time.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
              >
                Sign In to Citizen Portal →
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 transition-all"
              >
                Register New Account
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Voice-Guided Form Completion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete complex licensing forms effortlessly in Telugu or English with automatic spoken audio prompts and read-back confirmation.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Explainable Pre-Screening</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Before final submission, the system pre-screens your uploaded documents and highlights any discrepancies so you can fix them early.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Transparent Official Adjudication</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track departmental verification progress in real-time. If an application requires correction, view clear officer feedback and resubmit easily.
            </p>
          </div>
        </div>

        {/* Auth Modal */}
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            defaultMode={authMode}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={() => loadApplications()}
          />
        )}
      </div>
    );
  }

  // If citizen IS logged in: Render Full Citizen Dashboard
  return (
    <div className="space-y-6">
      {/* Citizen Welcome & Profile Strip */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {user?.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Verified Citizen
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.email} {user?.phoneNumber ? `&bull; ${user.phoneNumber}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenWizard()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Application</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-400 font-medium uppercase block">Total</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalApps}</span>
          <span className="text-[11px] text-slate-500">All submissions</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-400 font-medium uppercase block">In Draft</span>
          <span className="text-2xl font-bold text-slate-700 mt-1 block">{draftApps}</span>
          <span className="text-[11px] text-slate-500">Unsubmitted</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-amber-600 font-medium uppercase block">Verifying</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{pendingApps}</span>
          <span className="text-[11px] text-amber-600">Under review</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-emerald-600 font-medium uppercase block">Approved</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{approvedApps}</span>
          <span className="text-[11px] text-emerald-600">Active licenses</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center col-span-2 md:col-span-1">
          <span className="text-xs text-red-600 font-medium uppercase block">Action Needed</span>
          <span className="text-2xl font-bold text-red-700 mt-1 block">{rejectedApps}</span>
          <span className="text-[11px] text-red-600">Rejected / Resubmit</span>
        </div>
      </div>

      {/* Applications Table & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        {/* Controls Toolbar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Applications</h3>
            <p className="text-xs text-slate-500">Track and manage your licensing application dossier.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference or service..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-56"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Statuses ({applications.length})</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Action Required / Rejected</option>
            </select>

            <button
              type="button"
              onClick={loadApplications}
              disabled={loading}
              title="Refresh list"
              className="p-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Loading your applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">No applications found</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {applications.length === 0
                    ? 'You have not submitted or drafted any licensing applications yet.'
                    : 'No applications match your active search or filter.'}
                </p>
              </div>
              {applications.length === 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenWizard()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start First Application</span>
                </button>
              )}
            </div>
          ) : (
            filteredApps.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {item.referenceNumber}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{item.serviceName}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>{item.departmentName}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {item.status === 'DRAFT' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const full = await applicationApi.getApplicationById(item.id);
                        handleOpenWizard(full);
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <span>Continue Draft</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : item.status === 'REJECTED' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const full = await applicationApi.getApplicationById(item.id);
                        handleOpenWizard(full);
                      }}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Action Required / Resubmit</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setSelectedAppId(item.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
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
