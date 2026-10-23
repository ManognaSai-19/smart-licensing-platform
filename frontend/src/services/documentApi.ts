import { DocumentChecklistStatus, DocumentUploadResponse } from '../types/document';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const documentApi = {
  async getChecklist(applicationId: number): Promise<DocumentChecklistStatus[]> {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/documents/checklist`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch document checklist: ${res.status}`);
    }
    return res.json();
  },

  async getDocuments(applicationId: number): Promise<DocumentUploadResponse[]> {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/documents`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch documents: ${res.status}`);
    }
    return res.json();
  },

  async uploadDocument(
    applicationId: number,
    documentTypeId: number,
    file: File
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('documentTypeId', documentTypeId.toString());
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/applications/${applicationId}/documents`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to upload document: ${res.status}`);
    }
    return res.json();
  },

  async deleteDocument(applicationId: number, documentId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to delete document: ${res.status}`);
    }
    return res.json();
  },

  async validateChecklist(applicationId: number): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/documents/validate-checklist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Checklist validation failed: ${res.status}`);
    }
    return res.json();
  },
};
