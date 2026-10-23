package com.licensing.platform.dto;

public class VoiceNormalizationResponse {

    private String rawTranscript;
    private String normalizedValue;
    private String detectedIntent;
    private Double confidence;
    private String readbackText;

    public VoiceNormalizationResponse() {
    }

    public VoiceNormalizationResponse(String rawTranscript, String normalizedValue, String detectedIntent,
                                      Double confidence, String readbackText) {
        this.rawTranscript = rawTranscript;
        this.normalizedValue = normalizedValue;
        this.detectedIntent = detectedIntent;
        this.confidence = confidence;
        this.readbackText = readbackText;
    }

    public String getRawTranscript() {
        return rawTranscript;
    }

    public void setRawTranscript(String rawTranscript) {
        this.rawTranscript = rawTranscript;
    }

    public String getNormalizedValue() {
        return normalizedValue;
    }

    public void setNormalizedValue(String normalizedValue) {
        this.normalizedValue = normalizedValue;
    }

    public String getDetectedIntent() {
        return detectedIntent;
    }

    public void setDetectedIntent(String detectedIntent) {
        this.detectedIntent = detectedIntent;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getReadbackText() {
        return readbackText;
    }

    public void setReadbackText(String readbackText) {
        this.readbackText = readbackText;
    }
}
