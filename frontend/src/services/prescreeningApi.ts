import { PrescreeningFinding, PrescreeningSummary } from '../types/prescreening';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const prescreeningApi = {
  async runPrescreening(applicationId: number): Promise<PrescreeningSummary> {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/prescreening/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Pre-screening run failed: ${res.status}`);
    }
    return res.json();
  },

  async getSummary(applicationId: number): Promise<PrescreeningSummary> {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/prescreening/summary`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch pre-screening summary: ${res.status}`);
    }
    return res.json();
  },

  async getFindings(applicationId: number): Promise<PrescreeningFinding[]> {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/prescreening/findings`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch findings: ${res.status}`);
    }
    return res.json();
  },
};
