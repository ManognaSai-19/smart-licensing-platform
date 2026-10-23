import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApplicationDetail, ApplicationSummary, ApplicationStatus } from '../types/application';
import { DocumentUploadResponse } from '../types/document';
import { PrescreeningFinding } from '../types/prescreening';
import { officerApi } from '../services/officerApi';
import {
  FileText,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  UserCheck,
  Eye,
  FileCheck,
  ExternalLink,
  ShieldAlert,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Dossier State
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [dossier, setDossier] = useState<ApplicationDetail | null>(null);
  const [documents, setDocuments] = useState<DocumentUploadResponse[]>([]);
  const [findings, setFindings] = useState<PrescreeningFinding[]>([]);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Decision Modal State
  const [decisionModalMode, setDecisionModalMode] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [submittingDecision, setSubmittingDecision] = useState<boolean>(false);

  const loadQueue = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const data = await officerApi.getOfficerQueue();
      setQueue(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load department queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const openDossier = async (id: number) => {
    setSelectedAppId(id);
    setDossierLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const [appData, docsData, findingsData] = await Promise.all([
        officerApi.getApplication(id),
        officerApi.getDocuments(id),
        officerApi.getFindings(id),
      ]);
      setDossier(appData);
      setDocuments(docsData);
      setFindings(findingsData);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load application dossier');
    } finally {
      setDossierLoading(false);
    }
  };

  const closeDossier = () => {
    setSelectedAppId(null);
    setDossier(null);
    setDocuments([]);
    setFindings([]);
    setDecisionModalMode(null);
    setRejectionReason('');
    setDecisionNotes('');
    setActionError(null);
    setActionSuccess(null);
  };

  const handleStartReview = async (id: number) => {
    setActionError(null);
    try {
      const updated = await officerApi.startReview(id);
      setDossier(updated);
      setActionSuccess('Application marked as Under Verification.');
      loadQueue();
    } catch (err: any) {
      setActionError(err.message || 'Could not commence review');
    }
  };

  const handleSubmitDecision = async () => {
    if (!dossier || !decisionModalMode) return;

    if (decisionModalMode === 'REJECT' && !rejectionReason.trim()) {
      setActionError('A valid rejection reason is mandatory to reject an application.');
      return;
    }

    setSubmittingDecision(true);
    setActionError(null);
    try {
      const updated = await officerApi.submitDecision(dossier.id, {
        decision: decisionModalMode === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reason: decisionModalMode === 'REJECT' ? rejectionReason.trim() : undefined,
        notes: decisionNotes.trim() || undefined,
      });
      setDossier(updated);
      setActionSuccess(
        `Application ${updated.referenceNumber} successfully ${decisionModalMode === 'APPROVE' ? 'APPROVED' : 'REJECTED'}.`
      );
      setDecisionModalMode(null);
      setRejectionReason('');
      setDecisionNotes('');
      loadQueue();
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit adjudication decision');
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Filter queue
  const filteredQueue = queue.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      app.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" /> Pending Review
          </span>
        );
      case 'UNDER_VERIFICATION':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <UserCheck className="w-3.5 h-3.5 mr-1 text-amber-600" /> In Verification
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const pendingCount = queue.filter((a) => a.status === 'SUBMITTED').length;
  const inReviewCount = queue.filter((a) => a.status === 'UNDER_VERIFICATION').length;
  const approvedCount = queue.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = queue.filter((a) => a.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Officer Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Officer Adjudication Queue</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              <Building className="w-3.5 h-3.5 mr-1.5" />
              {user?.departmentName || user?.departmentCode || 'Assigned Department'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <span className="font-medium text-slate-700">{user?.fullName}</span> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadQueue}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Pending Review</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">In Verification</span>
            <UserCheck className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{inReviewCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Approved</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Rejected</span>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reference #, citizen name, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Pending Review (Submitted)</option>
            <option value="UNDER_VERIFICATION">Under Verification</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
            <p>Loading queue applications...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Applications in Queue</h3>
            <p className="text-sm text-slate-500 mt-1">There are no applications matching your current filter in this department queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ref Number</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredQueue.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {app.referenceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {app.serviceName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{app.citizenName}</div>
                      <div className="text-xs text-slate-400">{app.citizenEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {app.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleStartReview(app.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-indigo-200 text-xs font-medium rounded text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" /> Start Review
                        </button>
                      )}
                      <button
                        onClick={() => openDossier(app.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dossier Inspection Modal / Slide-over */}
      {selectedAppId && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900 bg-opacity-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="officer-dossier-title"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 id="officer-dossier-title" className="text-lg font-bold text-slate-900">
                    Application Dossier: {dossier?.referenceNumber || `ID #${selectedAppId}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {dossier?.serviceName} • {dossier?.departmentName}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDossier}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Messages */}
            {actionError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {actionSuccess}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {dossierLoading ? (
                <div className="p-12 text-center text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                  <p>Loading application dossier...</p>
                </div>
              ) : dossier ? (
                <>
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Current Status</span>
                      <div className="mt-1">{getStatusBadge(dossier.status)}</div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Applicant</span>
                      <span className="text-sm font-semibold text-slate-900">{dossier.citizenName} ({dossier.citizenEmail})</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Language Preference</span>
                      <span className="text-sm font-mono uppercase font-bold text-slate-700">{dossier.languagePreference}</span>
                    </div>
                  </div>

                  {/* Form Data Section */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                      Applicant Form Details
                    </h4>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dossier.formData && Object.keys(dossier.formData).length > 0 ? (
                        Object.entries(dossier.formData).map(([key, val]) => (
                          <div key={key} className="border-b border-slate-200 pb-2">
                            <span className="text-xs font-medium text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <p className="text-sm font-semibold text-slate-800">{String(val || '—')}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 col-span-2">No form fields recorded.</p>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Documents Section */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-slate-500" />
                      Uploaded Verification Documents ({documents.length})
                    </h4>
                    {documents.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No documents attached.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-white shadow-sm"
                          >
                            <div className="truncate mr-3">
                              <p className="text-xs font-bold text-slate-800">{doc.documentTypeNameEn || doc.documentTypeCode}</p>
                              <p className="text-xs text-slate-500 truncate">{doc.fileName}</p>
                              <span className="text-[10px] text-slate-400">{(doc.fileSizeBytes / 1024).toFixed(1)} KB</span>
                            </div>
                            <a
                              href={doc.previewUrl || doc.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 text-xs border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" /> View
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* OCR & AI Pre-Screening Findings */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-indigo-600" />
                      AI OCR & Explainable Pre-Screening Findings
                    </h4>
                    {findings.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No automated pre-screening checks triggered.</p>
                    ) : (
                      <div className="space-y-3">
                        {findings.map((f) => (
                          <div
                            key={f.id}
                            className={`p-4 rounded-xl border ${
                              f.outcome === 'PASS'
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-rose-50/50 border-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold font-mono text-slate-800">
                                Rule: {f.ruleCode}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                  f.outcome === 'PASS'
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : 'bg-rose-200 text-rose-900'
                                }`}
                              >
                                {f.outcome} • Match: {f.confidence ? Math.round(f.confidence * 100) : 100}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mb-1">
                              <span className="font-semibold">Explanation: </span>
                              {f.explanation}
                            </p>
                            {f.suggestedAction && (
                              <p className="text-xs text-slate-600 italic">
                                <span className="font-semibold">Suggested Action: </span>
                                {f.suggestedAction}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Previous Decision History */}
                  {dossier.reviewDecisions && dossier.reviewDecisions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                        Adjudication History
                      </h4>
                      <div className="space-y-2">
                        {dossier.reviewDecisions.map((dec) => (
                          <div key={dec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <div className="flex items-center justify-between font-semibold">
                              <span className={dec.decision === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'}>
                                {dec.decision} by {dec.officerName}
                              </span>
                              <span className="text-slate-400">{new Date(dec.createdAt).toLocaleString()}</span>
                            </div>
                            {dec.reason && <p className="mt-1 text-slate-700 font-medium">Reason: {dec.reason}</p>}
                            {dec.notes && <p className="mt-0.5 text-slate-500">Notes: {dec.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer / Action Toolbar */}
            {dossier && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div>
                  {dossier.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleStartReview(dossier.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm inline-flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" /> Move to Verification
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {(dossier.status === 'UNDER_VERIFICATION' || dossier.status === 'SUBMITTED') && (
                    <>
                      <button
                        onClick={() => setDecisionModalMode('REJECT')}
                        className="px-4 py-2 border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 rounded-lg text-sm font-semibold shadow-sm inline-flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" /> Reject Application
                      </button>
                      <button
                        onClick={() => setDecisionModalMode('APPROVE')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Application
                      </button>
                    </>
                  )}
                  <button
                    onClick={closeDossier}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision Confirmation / Reason Modal */}
      {decisionModalMode && (
        <div
          className="fixed inset-0 z-60 overflow-y-auto bg-slate-900 bg-opacity-60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="decision-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 id="decision-modal-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {decisionModalMode === 'APPROVE' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Confirm Approval
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" /> Mandatory Rejection Reason
                  </>
                )}
              </h3>
              <button
                onClick={() => setDecisionModalMode(null)}
                aria-label="Close decision dialog"
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {decisionModalMode === 'APPROVE'
                ? `You are about to issue approval for ${dossier?.referenceNumber}. The license will be marked as APPROVED.`
                : `Please provide a clear and legally defensible explanation for rejecting ${dossier?.referenceNumber}. This will be communicated to the citizen.`}
            </p>

            {decisionModalMode === 'REJECT' && (
              <div>
                <label
                  htmlFor="officer-rejection-reason"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Rejection Reason <span className="text-rose-600">* Required</span>
                </label>
                <textarea
                  id="officer-rejection-reason"
                  name="rejectionReason"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Aadhaar address does not match permanent address specified in form..."
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="officer-decision-notes"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Internal Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="officer-decision-notes"
                name="internalNotes"
                rows={2}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Internal department audit notes..."
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDecisionModalMode(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingDecision || (decisionModalMode === 'REJECT' && !rejectionReason.trim())}
                onClick={handleSubmitDecision}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm inline-flex items-center gap-1.5 ${
                  decisionModalMode === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700 disabled:opacity-50'
                }`}
              >
                {submittingDecision && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {decisionModalMode === 'APPROVE' ? 'Confirm Approval' : 'Submit Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
