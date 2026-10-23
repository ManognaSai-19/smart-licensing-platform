package com.licensing.platform.model;

import com.licensing.platform.model.enums.FindingOutcome;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "prescreening_findings")
public class PrescreeningFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private ApplicationDocument document;

    @Column(name = "rule_code", nullable = false, length = 100)
    private String ruleCode;

    @Column(name = "field_key", length = 100)
    private String fieldKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FindingOutcome outcome;

    @Column(name = "expected_value", columnDefinition = "TEXT")
    private String expectedValue;

    @Column(name = "extracted_value", columnDefinition = "TEXT")
    private String extractedValue;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "suggested_action", columnDefinition = "TEXT")
    private String suggestedAction;

    @Column(precision = 5, scale = 4)
    private BigDecimal confidence;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public PrescreeningFinding() {
    }

    public PrescreeningFinding(Application application, ApplicationDocument document, String ruleCode,
                               String fieldKey, FindingOutcome outcome, String expectedValue,
                               String extractedValue, String explanation, String suggestedAction, BigDecimal confidence) {
        this.application = application;
        this.document = document;
        this.ruleCode = ruleCode;
        this.fieldKey = fieldKey;
        this.outcome = outcome;
        this.expectedValue = expectedValue;
        this.extractedValue = extractedValue;
        this.explanation = explanation;
        this.suggestedAction = suggestedAction;
        this.confidence = confidence;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ApplicationDocument getDocument() {
        return document;
    }

    public void setDocument(ApplicationDocument document) {
        this.document = document;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public void setRuleCode(String ruleCode) {
        this.ruleCode = ruleCode;
    }

    public String getFieldKey() {
        return fieldKey;
    }

    public void setFieldKey(String fieldKey) {
        this.fieldKey = fieldKey;
    }

    public FindingOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(FindingOutcome outcome) {
        this.outcome = outcome;
    }

    public String getExpectedValue() {
        return expectedValue;
    }

    public void setExpectedValue(String expectedValue) {
        this.expectedValue = expectedValue;
    }

    public String getExtractedValue() {
        return extractedValue;
    }

    public void setExtractedValue(String extractedValue) {
        this.extractedValue = extractedValue;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }

    public void setSuggestedAction(String suggestedAction) {
        this.suggestedAction = suggestedAction;
    }

    public BigDecimal getConfidence() {
        return confidence;
    }

    public void setConfidence(BigDecimal confidence) {
        this.confidence = confidence;
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
        if (!(o instanceof PrescreeningFinding that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
