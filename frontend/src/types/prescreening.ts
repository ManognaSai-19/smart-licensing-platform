export type FindingOutcome = 'PASS' | 'FAIL' | 'WARNING' | 'NEEDS_MANUAL_REVIEW';

export interface PrescreeningFinding {
  id: number;
  applicationId: number;
  documentId?: number;
  documentName?: string;
  ruleCode: string;
  fieldKey?: string;
  outcome: FindingOutcome;
  expectedValue?: string;
  extractedValue?: string;
  explanation: string;
  suggestedAction?: string;
  confidence?: number;
  createdAt: string;
}

export interface OcrExtraction {
  id: number;
  documentId: number;
  documentName: string;
  engineName: string;
  engineVersion: string;
  rawText: string;
  extractedFields: Record<string, any>;
  confidenceScore: number;
  processingStatus: string;
  createdAt: string;
}

export interface PrescreeningSummary {
  applicationId: number;
  referenceNumber: string;
  overallStatus: 'PASSED' | 'HAS_WARNINGS' | 'HAS_FAILS' | 'NEEDS_MANUAL_REVIEW';
  totalFindings: number;
  passCount: number;
  failCount: number;
  warningCount: number;
  manualReviewCount: number;
  averageConfidence: number;
  findings: PrescreeningFinding[];
  extractions: OcrExtraction[];
}
