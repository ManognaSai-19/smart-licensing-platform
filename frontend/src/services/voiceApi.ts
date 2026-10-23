import {
  VoiceNormalizationRequest,
  VoiceNormalizationResponse,
  VoiceServiceGuidanceResponse,
  VoiceStatsResponse,
  VoiceTelemetryRequest,
  VoiceTelemetryResponse,
} from '../types/voice';

const API_BASE = '/api/voice';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const voiceApi = {
  /**
   * Fetch multilingual voice prompts for a specific service
   */
  async getPrompts(serviceCode: string, lang: string = 'en'): Promise<VoiceServiceGuidanceResponse> {
    const res = await fetch(`${API_BASE}/prompts/${encodeURIComponent(serviceCode)}?lang=${encodeURIComponent(lang)}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch voice prompts: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Normalize spoken transcript into structured field value
   */
  async normalize(request: VoiceNormalizationRequest): Promise<VoiceNormalizationResponse> {
    const res = await fetch(`${API_BASE}/normalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to normalize voice: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Log voice interaction telemetry for evaluation metrics
   */
  async recordTelemetry(request: VoiceTelemetryRequest): Promise<VoiceTelemetryResponse> {
    const res = await fetch(`${API_BASE}/telemetry`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to record voice telemetry: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Fetch aggregated voice statistics for research analytics
   */
  async getStats(): Promise<VoiceStatsResponse> {
    const res = await fetch(`${API_BASE}/telemetry/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch voice stats: ${res.status}`);
    }
    return res.json();
  },
};
