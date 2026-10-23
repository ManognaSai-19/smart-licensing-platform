package com.licensing.platform.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public class OcrExtractionResponse {

    private Long id;
    private Long documentId;
    private String documentName;
    private String engineName;
    private String engineVersion;
    private String rawText;
    private Map<String, Object> extractedFields;
    private BigDecimal confidenceScore;
    private String processingStatus;
    private Instant createdAt;

    public OcrExtractionResponse() {
    }

    public OcrExtractionResponse(Long id, Long documentId, String documentName, String engineName,
                                 String engineVersion, String rawText, Map<String, Object> extractedFields,
                                 BigDecimal confidenceScore, String processingStatus, Instant createdAt) {
        this.id = id;
        this.documentId = documentId;
        this.documentName = documentName;
        this.engineName = engineName;
        this.engineVersion = engineVersion;
        this.rawText = rawText;
        this.extractedFields = extractedFields;
        this.confidenceScore = confidenceScore;
        this.processingStatus = processingStatus;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getEngineName() {
        return engineName;
    }

    public void setEngineName(String engineName) {
        this.engineName = engineName;
    }

    public String getEngineVersion() {
        return engineVersion;
    }

    public void setEngineVersion(String engineVersion) {
        this.engineVersion = engineVersion;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    public Map<String, Object> getExtractedFields() {
        return extractedFields;
    }

    public void setExtractedFields(Map<String, Object> extractedFields) {
        this.extractedFields = extractedFields;
    }

    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(BigDecimal confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getProcessingStatus() {
        return processingStatus;
    }

    public void setProcessingStatus(String processingStatus) {
        this.processingStatus = processingStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
