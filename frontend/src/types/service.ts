export type FieldDataType = 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT';

export interface Department {
  id: number;
  code: string;
  name: string;
  description: string;
  serviceCount: number;
  createdAt: string;
}

export interface ServiceField {
  id: number;
  fieldKey: string;
  labelEn: string;
  labelTe: string;
  dataType: FieldDataType;
  required: boolean;
  validationRules?: string;
  optionsJson?: string;
  displayOrder: number;
}

export interface RequiredDocumentType {
  id: number;
  documentCode: string;
  nameEn: string;
  nameTe: string;
  required: boolean;
  acceptedMimeTypes: string;
  maxSizeBytes: number;
}

export interface ServiceSummary {
  id: number;
  code: string;
  name: string;
  description: string;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  active: boolean;
  sampleFee: number;
  processingTimeDays: number;
  fieldCount: number;
  documentCount: number;
  createdAt: string;
}

export interface ServiceDetail extends ServiceSummary {
  fields: ServiceField[];
  requiredDocuments: RequiredDocumentType[];
}

export interface ServiceCreateRequest {
  code: string;
  name: string;
  description?: string;
  departmentId: number;
  sampleFee: number;
  processingTimeDays: number;
  active?: boolean;
}

export interface ServiceUpdateRequest {
  name: string;
  description?: string;
  departmentId: number;
  sampleFee: number;
  processingTimeDays: number;
  active?: boolean;
}
