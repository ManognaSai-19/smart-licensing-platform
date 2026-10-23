package com.licensing.platform.dto;

import java.time.Instant;

public class VoiceTelemetryResponse {

    private Long id;
    private Long applicationId;
    private String serviceCode;
    private String fieldKey;
    private String language;
    private Boolean confirmedByUser;
    private String inputMode;
    private Instant createdAt;

    public VoiceTelemetryResponse() {
    }

    public VoiceTelemetryResponse(Long id, Long applicationId, String serviceCode, String fieldKey,
                                  String language, Boolean confirmedByUser, String inputMode, Instant createdAt) {
        this.id = id;
        this.applicationId = applicationId;
        this.serviceCode = serviceCode;
        this.fieldKey = fieldKey;
        this.language = language;
        this.confirmedByUser = confirmedByUser;
        this.inputMode = inputMode;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
