package com.licensing.platform.dto;

import com.licensing.platform.model.enums.FindingOutcome;

import java.math.BigDecimal;
import java.time.Instant;

public class PrescreeningFindingResponse {

    private Long id;
    private Long applicationId;
    private Long documentId;
    private String documentName;
    private String ruleCode;
    private String fieldKey;
    private FindingOutcome outcome;
    private String expectedValue;
    private String extractedValue;
    private String explanation;
    private String suggestedAction;
    private BigDecimal confidence;
    private Instant createdAt;

    public PrescreeningFindingResponse() {
    }

    public PrescreeningFindingResponse(Long id, Long applicationId, Long documentId, String documentName,
                                      String ruleCode, String fieldKey, FindingOutcome outcome,
                                      String expectedValue, String extractedValue, String explanation,
                                      String suggestedAction, BigDecimal confidence, Instant createdAt) {
        this.id = id;
        this.applicationId = applicationId;
        this.documentId = documentId;
        this.documentName = documentName;
        this.ruleCode = ruleCode;
        this.fieldKey = fieldKey;
        this.outcome = outcome;
        this.expectedValue = expectedValue;
        this.extractedValue = extractedValue;
        this.explanation = explanation;
        this.suggestedAction = suggestedAction;
        this.confidence = confidence;
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
}
