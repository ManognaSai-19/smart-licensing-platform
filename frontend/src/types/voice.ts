export interface VoicePrompt {
  fieldKey: string;
  label: string;
  spokenPrompt: string;
  spokenExample: string;
  dataType: string;
  isRequired: boolean;
  readbackTemplate: string;
  options?: string[];
  validationHint?: string;
}

export interface VoiceServiceGuidanceResponse {
  serviceCode: string;
  serviceName: string;
  language: string;
  welcomePrompt: string;
  completionPrompt: string;
  errorPrompt: string;
  fields: VoicePrompt[];
}

export interface VoiceNormalizationRequest {
  fieldKey?: string;
  rawTranscript: string;
  language?: string;
  dataType?: string;
}

export interface VoiceNormalizationResponse {
  rawTranscript: string;
  normalizedValue: string;
  detectedIntent: 'CONFIRM_YES' | 'CONFIRM_NO' | 'REPEAT' | 'VALUE_INPUT' | 'UNKNOWN' | string;
  confidence: number;
  readbackText: string;
}

export interface VoiceTelemetryRequest {
  applicationId?: number;
  serviceCode: string;
  fieldKey: string;
  language: string;
  rawTranscript?: string;
  normalizedValue?: string;
  confidenceScore?: number;
  durationMs?: number;
  correctionCount?: number;
  confirmedByUser?: boolean;
  inputMode?: 'VOICE' | 'KEYBOARD_FALLBACK' | string;
}

export interface VoiceTelemetryResponse {
  id: number;
  applicationId?: number;
  serviceCode: string;
  fieldKey: string;
  language: string;
  confirmedByUser: boolean;
  inputMode: string;
  createdAt: string;
}

export interface VoiceStatsResponse {
  totalInteractions: number;
  confirmedInteractions: number;
  confirmationRate: number;
  averageConfidence: number;
  averageCorrectionCount: number;
  languageBreakdown: Record<string, number>;
  inputModeBreakdown: Record<string, number>;
}
