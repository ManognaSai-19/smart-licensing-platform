import { ApplicationSummary, ApplicationStatus } from '../types/application';
import { AuditLogEntry, SystemStats } from '../types/admin';
import { ServiceSummary, ServiceDetail, ServiceCreateRequest, ServiceUpdateRequest, Department } from '../types/service';
import { authApi } from './authApi';

function getHeaders(): HeadersInit {
  const token = authApi.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const adminApi = {
  /**
   * Fetch all applications with cross-department admin oversight.
   */
  async getAllApplications(status?: ApplicationStatus, departmentId?: number, query?: string): Promise<ApplicationSummary[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (departmentId) params.append('departmentId', departmentId.toString());
    if (query) params.append('query', query);

    const res = await fetch(`/api/applications?${params.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch admin applications oversight');
    }
    return res.json();
  },

  /**
   * Fetch system audit log trail (last 100 entries)
   */
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch('/api/admin/audit', {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch audit logs');
    }
    return res.json();
  },

  /**
   * Fetch platform statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    const res = await fetch('/api/admin/system-stats', {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch system stats');
    }
    return res.json();
  },

  /**
   * Fetch all departments
   */
  async getDepartments(): Promise<Department[]> {
    const res = await fetch('/api/departments', {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch departments');
    }
    return res.json();
  },

  /**
   * Fetch all services (including inactive ones)
   */
  async getAllServices(): Promise<ServiceSummary[]> {
    const res = await fetch('/api/services?activeOnly=false', {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch service catalogue');
    }
    return res.json();
  },

  /**
   * Create a new service definition in the catalogue
   */
  async createService(request: ServiceCreateRequest): Promise<ServiceDetail> {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create service');
    }
    return res.json();
  },

  /**
   * Update an existing service definition
   */
  async updateService(id: number, request: ServiceUpdateRequest): Promise<ServiceDetail> {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update service');
    }
    return res.json();
  },

  /**
   * Deactivate a service definition
   */
  async deactivateService(id: number): Promise<void> {
    const res = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to deactivate service');
    }
  },
};
