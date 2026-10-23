import {
  ApplicationDetail,
  ApplicationSummary,
  CreateDraftRequest,
  UpdateDraftRequest,
} from '../types/application';
import { authApi } from './authApi';

const API_BASE = '/api/applications';

function getHeaders(): HeadersInit {
  const token = authApi.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const applicationApi = {
  /**
   * Create a new application draft
   */
  async createDraft(request: CreateDraftRequest): Promise<ApplicationDetail> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create application draft');
    }

    return res.json();
  },

  /**
   * List all applications created by the authenticated citizen
   */
  async getMyApplications(): Promise<ApplicationSummary[]> {
    const res = await fetch(`${API_BASE}/mine`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch your applications');
    }

    return res.json();
  },

  /**
   * Fetch full application dossier by ID
   */
  async getApplicationById(id: number): Promise<ApplicationDetail> {
    const res = await fetch(`${API_BASE}/${id}`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch application #${id}`);
    }

    return res.json();
  },

  /**
   * Update draft form fields
   */
  async updateDraft(id: number, request: UpdateDraftRequest): Promise<ApplicationDetail> {
    const res = await fetch(`${API_BASE}/${id}/draft`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update draft');
    }

    return res.json();
  },

  /**
   * Transition application from DRAFT to SUBMITTED
   */
  async submitApplication(id: number): Promise<ApplicationDetail> {
    const res = await fetch(`${API_BASE}/${id}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Application submission failed. Please verify required fields and documents.');
    }

    return res.json();
  },

  /**
   * Re-submit application after addressing rejection reasons
   */
  async resubmitApplication(id: number): Promise<ApplicationDetail> {
    const res = await fetch(`${API_BASE}/${id}/resubmit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Resubmission failed');
    }

    return res.json();
  },
};
