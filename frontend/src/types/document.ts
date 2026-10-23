export interface DocumentUploadResponse {
  id: number;
  applicationId: number;
  documentTypeId: number;
  documentTypeCode: string;
  documentTypeNameEn: string;
  documentTypeNameTe: string;
  fileName: string;
  storageKey: string;
  contentType: string;
  fileSizeBytes: number;
  fileChecksum: string;
  uploadedAt: string;
  previewUrl: string;
  downloadUrl: string;
}

export interface DocumentChecklistStatus {
  requiredDocumentTypeId: number;
  documentCode: string;
  nameEn: string;
  nameTe: string;
  required: boolean;
  acceptedMimeTypes: string;
  maxSizeBytes: number;
  uploaded: boolean;
  documentId?: number;
  fileName?: string;
  contentType?: string;
  fileSizeBytes?: number;
  uploadedAt?: string;
  previewUrl?: string;
  downloadUrl?: string;
}
