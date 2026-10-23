export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESUBMITTED';

export interface ApplicationStatusHistory {
  id: number;
  fromStatus: string;
  toStatus: string;
  changedByName: string;
  notes?: string;
  createdAt: string;
}

export interface ReviewDecision {
  id: number;
  decision: 'APPROVED' | 'REJECTED';
  reason?: string;
  notes?: string;
  officerName: string;
  createdAt: string;
}

export interface ApplicationSummary {
  id: number;
  referenceNumber: string;
  serviceId: number;
  serviceCode: string;
  serviceName: string;
  departmentId: number;
  departmentName: string;
  status: ApplicationStatus;
  citizenId: number;
  citizenName: string;
  citizenEmail: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDetail extends ApplicationSummary {
  formData: Record<string, any>;
  languagePreference: string;
  statusHistory: ApplicationStatusHistory[];
  reviewDecisions: ReviewDecision[];
  documentCount: number;
  findingCount: number;
}

export interface CreateDraftRequest {
  serviceId: number;
  languagePreference?: string;
  initialFormData?: Record<string, any>;
}

export interface UpdateDraftRequest {
  formData: Record<string, any>;
  languagePreference?: string;
}
