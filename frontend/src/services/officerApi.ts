import { ApplicationDetail, ApplicationSummary, ApplicationStatus } from '../types/application';
import { ReviewDecisionRequest } from '../types/officer';
import { DocumentUploadResponse } from '../types/document';
import { PrescreeningFinding } from '../types/prescreening';
import { authApi } from './authApi';

function getHeaders(): HeadersInit {
  const token = authApi.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const officerApi = {
  /**
   * Fetch applications assigned to the logged-in officer's department queue.
   */
  async getOfficerQueue(status?: ApplicationStatus, query?: string): Promise<ApplicationSummary[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (query) params.append('query', query);

    const res = await fetch(`/api/applications/officer/queue?${params.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch officer queue');
    }
    return res.json();
  },

  /**
   * Fetch complete dossier for an application
   */
  async getApplication(id: number): Promise<ApplicationDetail> {
    const res = await fetch(`/api/applications/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch application dossier');
    }
    return res.json();
  },

  /**
   * Transition application into UNDER_VERIFICATION state
   */
  async startReview(id: number): Promise<ApplicationDetail> {
    const res = await fetch(`/api/applications/${id}/start-review`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to begin verification');
    }
    return res.json();
  },

  /**
   * Submit final adjudication decision (APPROVED or REJECTED)
   */
  async submitDecision(id: number, request: ReviewDecisionRequest): Promise<ApplicationDetail> {
    const res = await fetch(`/api/applications/${id}/decision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit decision');
    }
    return res.json();
  },

  /**
   * Retrieve uploaded documents for this application
   */
  async getDocuments(applicationId: number): Promise<DocumentUploadResponse[]> {
    const res = await fetch(`/api/applications/${applicationId}/documents`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch application documents');
    }
    return res.json();
  },

  /**
   * Retrieve OCR pre-screening findings and explainability insights
   */
  async getFindings(applicationId: number): Promise<PrescreeningFinding[]> {
    const res = await fetch(`/api/applications/${applicationId}/prescreening/findings`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch pre-screening findings');
    }
    return res.json();
  },
};
