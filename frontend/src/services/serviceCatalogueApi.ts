import { Department, ServiceDetail, ServiceSummary } from '../types/service';

const API_BASE = '/api';

export async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE}/departments`);
  if (!res.ok) {
    throw new Error(`Failed to fetch departments: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchServices(departmentId?: number, query?: string): Promise<ServiceSummary[]> {
  const params = new URLSearchParams();
  if (departmentId) {
    params.append('departmentId', departmentId.toString());
  }
  if (query && query.trim()) {
    params.append('query', query.trim());
  }

  const url = `${API_BASE}/services${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch services: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchServiceById(id: number): Promise<ServiceDetail> {
  const res = await fetch(`${API_BASE}/services/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch service details: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchServiceByCode(code: string): Promise<ServiceDetail> {
  const res = await fetch(`${API_BASE}/services/code/${code}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch service details: ${res.statusText}`);
  }
  return res.json();
}
