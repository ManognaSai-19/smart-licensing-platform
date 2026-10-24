import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApplicationDetail, ApplicationSummary, ApplicationStatus } from '../types/application';
import { DocumentUploadResponse } from '../types/document';
import { PrescreeningFinding } from '../types/prescreening';
import { officerApi } from '../services/officerApi';
import { StatusBadge, MetricCard } from './ui/designSystem';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
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
      setActionSuccess('Application status updated to Under Verification.');
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
    const matchesStatus = statusFilter === 'ALL' || app.status === (statusFilter as ApplicationStatus);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.referenceNumber.toLowerCase().includes(q) ||
      app.citizenName.toLowerCase().includes(q) ||
      app.serviceName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = queue.filter((a) => a.status === 'SUBMITTED' || a.status === 'RESUBMITTED').length;
  const inReviewCount = queue.filter((a) => a.status === 'UNDER_VERIFICATION').length;
  const approvedCount = queue.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = queue.filter((a) => a.status === 'REJECTED').length;

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto pb-8 animate-in fade-in">
      {/* Officer Header */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#101828] tracking-tight">
              Officer Adjudication Queue
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2FF] text-[#2563EB] border border-[#2563EB]/20">
              <Building className="w-3.5 h-3.5 mr-1.5" />
              {user?.departmentName || user?.departmentCode || 'Department Queue'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Reviewer: <span className="font-bold text-[#0F172A]">{user?.fullName}</span> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadQueue}
            disabled={loading}
            className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-[#0F172A] hover:bg-slate-50 transition flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2563EB]' : 'text-slate-500'}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Case Management Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Pending Review"
          value={pendingCount}
          helperText="Awaiting initial verification"
          tone="blue"
        />
        <MetricCard
          label="In Verification"
          value={inReviewCount}
          helperText="Under review"
          tone="amber"
        />
        <MetricCard
          label="Approved"
          value={approvedCount}
          helperText="Licenses issued"
          tone="green"
        />
        <MetricCard
          label="Rejected"
          value={rejectedCount}
          helperText="Action required"
          tone="default"
          className="border-rose-200/80 bg-rose-50/50"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by reference #, citizen name, or service title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-300 rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-xl text-xs font-bold px-3 py-2.5 bg-[#F8FAFC] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
          >
            <option value="ALL">All Statuses ({queue.length})</option>
            <option value="SUBMITTED">Pending Review (Submitted)</option>
            <option value="UNDER_VERIFICATION">Under Verification</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#2563EB] mb-3" />
            <p className="text-xs font-semibold">Loading queue applications...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-[#101828]">No Applications in Queue</h3>
            <p className="text-xs text-[#64748B]">There are no applications matching your filter in this department queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Ref Number</th>
                  <th className="py-3.5 px-4">Service Name</th>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#2563EB]">
                      {app.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                      {app.serviceName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0F172A]">{app.citizenName}</div>
                      <div className="text-[11px] text-[#64748B]">{app.citizenEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      {app.status === 'SUBMITTED' && (
                        <button
                          type="button"
                          onClick={() => handleStartReview(app.id)}
                          className="px-3 py-1.5 bg-[#EAF2FF] text-[#2563EB] hover:bg-blue-100 rounded-xl text-xs font-bold transition inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Start Review</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openDossier(app.id)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#2563EB] text-[#0F172A] rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dossier Inspection Modal */}
      {selectedAppId && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="officer-dossier-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-br from-[#101828] via-[#162544] to-[#1E3A8A] text-white flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                    {dossier?.referenceNumber || `ID #${selectedAppId}`}
                  </span>
                  {dossier && <StatusBadge status={dossier.status} />}
                </div>
                <h2 id="officer-dossier-title" className="text-lg font-black text-white">
                  Application Dossier Review
                </h2>
                <p className="text-xs text-slate-300">
                  {dossier?.serviceName} &bull; {dossier?.departmentName}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDossier}
                aria-label="Close dossier"
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Messages */}
            {actionError && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-[#B91C1C] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#B91C1C]" />
                <span className="font-semibold">{actionError}</span>
              </div>
            )}
            {actionSuccess && (
              <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-[#15803D] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15803D]" />
                <span className="font-semibold">{actionSuccess}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {dossierLoading ? (
                <div className="p-12 text-center text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#2563EB] mb-2" />
                  <p className="text-xs font-semibold">Loading full application dossier...</p>
                </div>
              ) : dossier ? (
                <>
                  {/* Status Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applicant</span>
                      <span className="font-bold text-[#0F172A] mt-0.5 block">{dossier.citizenName}</span>
                      <span className="text-[11px] text-[#64748B]">{dossier.citizenEmail}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submission Date</span>
                      <span className="font-bold text-[#0F172A] mt-0.5 block">
                        {dossier.submittedAt ? new Date(dossier.submittedAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Language Preference</span>
                      <span className="font-mono font-bold text-[#2563EB] mt-0.5 block uppercase">
                        {dossier.languagePreference || 'EN'}
                      </span>
                    </div>
                  </div>

                  {/* Form Data Section */}
                  <div>
                    <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#2563EB]" />
                      <span>Applicant Form Details</span>
                    </h3>
                    <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dossier.formData && Object.keys(dossier.formData).length > 0 ? (
                        Object.entries(dossier.formData).map(([key, val]) => (
                          <div key={key} className="p-2.5 bg-white rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <p className="text-xs font-bold text-[#0F172A] mt-0.5 break-words">
                              {String(val || '—')}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 col-span-2 italic">No form fields recorded.</p>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Documents Section */}
                  <div>
                    <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#2563EB]" />
                      <span>Uploaded Verification Documents ({documents.length})</span>
                    </h3>
                    {documents.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No documents attached.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3.5 border border-slate-200 rounded-2xl flex items-center justify-between bg-white shadow-2xs"
                          >
                            <div className="truncate mr-3 space-y-0.5">
                              <p className="text-xs font-bold text-[#0F172A]">{doc.documentTypeNameEn || doc.documentTypeCode}</p>
                              <p className="text-[11px] text-[#64748B] truncate">{doc.fileName}</p>
                              <span className="text-[10px] text-slate-400">{(doc.fileSizeBytes / 1024).toFixed(1)} KB</span>
                            </div>
                            <a
                              href={doc.previewUrl || doc.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl text-[#0F172A] hover:bg-slate-50 inline-flex items-center gap-1 shrink-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span>View</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* OCR & AI Pre-Screening Findings */}
                  <div>
                    <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                      <span>AI OCR & Pre-Screening Findings</span>
                    </h3>
                    {findings.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No automated pre-screening checks triggered.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {findings.map((f) => (
                          <div
                            key={f.id}
                            className={`p-3.5 rounded-2xl border ${
                              f.outcome === 'PASS'
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-rose-50/50 border-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold font-mono text-[#0F172A]">
                                Rule: {f.ruleCode}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                  f.outcome === 'PASS'
                                    ? 'bg-[#15803D]/10 text-[#15803D] border-[#15803D]/30'
                                    : 'bg-[#B91C1C]/10 text-[#B91C1C] border-[#B91C1C]/30'
                                }`}
                              >
                                {f.outcome} • Match: {f.confidence ? Math.round(f.confidence * 100) : 100}%
                              </span>
                            </div>
                            <p className="text-xs text-[#0F172A] mb-1">
                              <span className="font-semibold">Explanation: </span>
                              {f.explanation}
                            </p>
                            {f.suggestedAction && (
                              <p className="text-xs text-[#B45309] font-medium">
                                <span>Suggested Action: </span>
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
                      <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider mb-3">
                        Prior Adjudication Log
                      </h3>
                      <div className="space-y-2">
                        {dossier.reviewDecisions.map((dec) => (
                          <div key={dec.id} className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className={dec.decision === 'APPROVED' ? 'text-[#15803D]' : 'text-[#B91C1C]'}>
                                {dec.decision} by {dec.officerName}
                              </span>
                              <span className="text-slate-400 font-normal">{new Date(dec.createdAt).toLocaleString()}</span>
                            </div>
                            {dec.reason && <p className="text-[#0F172A] font-medium">Reason: {dec.reason}</p>}
                            {dec.notes && <p className="text-[#64748B] italic">Notes: "{dec.notes}"</p>}
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
              <div className="p-4 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between gap-3">
                <div>
                  {dossier.status === 'SUBMITTED' && (
                    <button
                      type="button"
                      onClick={() => handleStartReview(dossier.id)}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Move to Verification</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {(dossier.status === 'UNDER_VERIFICATION' || dossier.status === 'SUBMITTED') && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDecisionModalMode('REJECT')}
                        className="px-4 py-2 border border-rose-300 text-[#B91C1C] bg-white hover:bg-rose-50 rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Application</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecisionModalMode('APPROVE')}
                        className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Application</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={closeDossier}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-[#0F172A] hover:bg-slate-100 transition"
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
          className="fixed inset-0 z-60 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="decision-modal-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 id="decision-modal-title" className="text-base font-extrabold text-[#101828] flex items-center gap-2">
                {decisionModalMode === 'APPROVE' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                    <span>Confirm License Approval</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-[#B91C1C]" />
                    <span>Mandatory Rejection Justification</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setDecisionModalMode(null)}
                aria-label="Close decision dialog"
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              {decisionModalMode === 'APPROVE'
                ? `You are about to issue approval for ${dossier?.referenceNumber}. The license will be marked as APPROVED and the digital certificate will be generated.`
                : `Please provide a clear and legally defensible explanation for rejecting application ${dossier?.referenceNumber}. This reason will be communicated to the citizen.`}
            </p>

            {decisionModalMode === 'REJECT' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="officer-rejection-reason"
                  className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider"
                >
                  Discrepancy Reason <span className="text-[#B91C1C]">* Mandatory</span>
                </label>
                <textarea
                  id="officer-rejection-reason"
                  name="rejectionReason"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Identity document address does not match applicant permanent residence..."
                  className="w-full text-xs border border-slate-300 rounded-xl p-3 bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#B91C1C] focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="officer-decision-notes"
                className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider"
              >
                Internal Reviewer Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="officer-decision-notes"
                name="internalNotes"
                rows={2}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Internal department audit trail notes..."
                className="w-full text-xs border border-slate-300 rounded-xl p-3 bg-[#F8FAFC] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDecisionModalMode(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-[#0F172A] hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingDecision || (decisionModalMode === 'REJECT' && !rejectionReason.trim())}
                onClick={handleSubmitDecision}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs inline-flex items-center gap-1.5 transition ${
                  decisionModalMode === 'APPROVE'
                    ? 'bg-[#15803D] hover:bg-[#166534]'
                    : 'bg-[#B91C1C] hover:bg-rose-800 disabled:opacity-50'
                }`}
              >
                {submittingDecision && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{decisionModalMode === 'APPROVE' ? 'Confirm Approval' : 'Submit Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
