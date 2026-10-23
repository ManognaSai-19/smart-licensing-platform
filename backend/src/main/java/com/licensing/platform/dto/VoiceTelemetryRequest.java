package com.licensing.platform.dto;

import jakarta.validation.constraints.NotBlank;

public class VoiceTelemetryRequest {

    private Long applicationId;

    @NotBlank(message = "serviceCode is required")
    private String serviceCode;

    @NotBlank(message = "fieldKey is required")
    private String fieldKey;

    @NotBlank(message = "language is required")
    private String language;

    private String rawTranscript;
    private String normalizedValue;
    private Double confidenceScore;
    private Integer durationMs;
    private Integer correctionCount = 0;
    private Boolean confirmedByUser = true;
    private String inputMode = "VOICE";

    public VoiceTelemetryRequest() {
    }

    public VoiceTelemetryRequest(Long applicationId, String serviceCode, String fieldKey, String language,
                                 String rawTranscript, String normalizedValue, Double confidenceScore,
                                 Integer durationMs, Integer correctionCount, Boolean confirmedByUser, String inputMode) {
        this.applicationId = applicationId;
        this.serviceCode = serviceCode;
        this.fieldKey = fieldKey;
        this.language = language;
        this.rawTranscript = rawTranscript;
        this.normalizedValue = normalizedValue;
        this.confidenceScore = confidenceScore;
        this.durationMs = durationMs;
        this.correctionCount = correctionCount != null ? correctionCount : 0;
        this.confirmedByUser = confirmedByUser != null ? confirmedByUser : true;
        this.inputMode = inputMode != null ? inputMode : "VOICE";
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode;
    }

    public String getFieldKey() {
        return fieldKey;
    }

    public void setFieldKey(String fieldKey) {
        this.fieldKey = fieldKey;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
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

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public Integer getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(Integer durationMs) {
        this.durationMs = durationMs;
    }

    public Integer getCorrectionCount() {
        return correctionCount;
    }

    public void setCorrectionCount(Integer correctionCount) {
        this.correctionCount = correctionCount;
    }

    public Boolean getConfirmedByUser() {
        return confirmedByUser;
    }

    public void setConfirmedByUser(Boolean confirmedByUser) {
        this.confirmedByUser = confirmedByUser;
    }

    public String getInputMode() {
        return inputMode;
    }

    public void setInputMode(String inputMode) {
        this.inputMode = inputMode;
    }
}
