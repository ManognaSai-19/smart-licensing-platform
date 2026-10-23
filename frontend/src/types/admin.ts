export interface AuditLogEntry {
  id: number;
  actorId?: number;
  actorName: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId?: number;
  ipAddress?: string;
  details?: string;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalCitizens: number;
  totalOfficers: number;
  totalDepartments: number;
  totalServices: number;
  totalApplications: number;
  statusBreakdown: Record<string, number>;
}
