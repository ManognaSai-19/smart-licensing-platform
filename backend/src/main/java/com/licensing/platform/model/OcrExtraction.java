package com.licensing.platform.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "ocr_extractions")
public class OcrExtraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private ApplicationDocument document;

    @Column(name = "engine_name", nullable = false, length = 100)
    private String engineName;

    @Column(name = "engine_version", nullable = false, length = 50)
    private String engineVersion;

    @Column(name = "raw_text", columnDefinition = "TEXT")
    private String rawText;

    @Column(name = "extracted_fields", columnDefinition = "TEXT")
    private String extractedFields;

    @Column(name = "confidence_score", precision = 5, scale = 4)
    private BigDecimal confidenceScore;

    @Column(name = "processing_status", nullable = false, length = 50)
    private String processingStatus = "COMPLETED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public OcrExtraction() {
    }

    public OcrExtraction(ApplicationDocument document, String engineName, String engineVersion, String rawText,
                         String extractedFields, BigDecimal confidenceScore, String processingStatus) {
        this.document = document;
        this.engineName = engineName;
        this.engineVersion = engineVersion;
        this.rawText = rawText;
        this.extractedFields = extractedFields;
        this.confidenceScore = confidenceScore;
        this.processingStatus = processingStatus != null ? processingStatus : "COMPLETED";
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ApplicationDocument getDocument() {
        return document;
    }

    public void setDocument(ApplicationDocument document) {
        this.document = document;
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

    public String getExtractedFields() {
        return extractedFields;
    }

    public void setExtractedFields(String extractedFields) {
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OcrExtraction that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
