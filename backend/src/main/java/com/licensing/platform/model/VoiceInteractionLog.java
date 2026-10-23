package com.licensing.platform.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "voice_interaction_logs")
public class VoiceInteractionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_id")
    private Long applicationId;

    @Column(name = "service_code", nullable = false, length = 100)
    private String serviceCode;

    @Column(name = "field_key", nullable = false, length = 100)
    private String fieldKey;

    @Column(name = "language", nullable = false, length = 20)
    private String language;

    @Column(name = "raw_transcript", columnDefinition = "TEXT")
    private String rawTranscript;

    @Column(name = "normalized_value", columnDefinition = "TEXT")
    private String normalizedValue;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @Column(name = "correction_count", nullable = false)
    private Integer correctionCount = 0;

    @Column(name = "confirmed_by_user", nullable = false)
    private Boolean confirmedByUser = true;

    @Column(name = "input_mode", nullable = false, length = 50)
    private String inputMode = "VOICE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public VoiceInteractionLog() {
    }

    public VoiceInteractionLog(Long applicationId, String serviceCode, String fieldKey, String language,
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
        this.createdAt = Instant.now();
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        VoiceInteractionLog that = (VoiceInteractionLog) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
