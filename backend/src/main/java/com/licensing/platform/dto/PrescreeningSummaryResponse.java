package com.licensing.platform.dto;

import java.math.BigDecimal;
import java.util.List;

public class PrescreeningSummaryResponse {

    private Long applicationId;
    private String referenceNumber;
    private String overallStatus; // "PASSED", "HAS_WARNINGS", "HAS_FAILS", "NEEDS_MANUAL_REVIEW"
    private int totalFindings;
    private int passCount;
    private int failCount;
    private int warningCount;
    private int manualReviewCount;
    private BigDecimal averageConfidence;
    private List<PrescreeningFindingResponse> findings;
    private List<OcrExtractionResponse> extractions;

    public PrescreeningSummaryResponse() {
    }

    public PrescreeningSummaryResponse(Long applicationId, String referenceNumber, String overallStatus,
                                       int totalFindings, int passCount, int failCount, int warningCount,
                                       int manualReviewCount, BigDecimal averageConfidence,
                                       List<PrescreeningFindingResponse> findings,
                                       List<OcrExtractionResponse> extractions) {
        this.applicationId = applicationId;
        this.referenceNumber = referenceNumber;
        this.overallStatus = overallStatus;
        this.totalFindings = totalFindings;
        this.passCount = passCount;
        this.failCount = failCount;
        this.warningCount = warningCount;
        this.manualReviewCount = manualReviewCount;
        this.averageConfidence = averageConfidence;
        this.findings = findings;
        this.extractions = extractions;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getOverallStatus() {
        return overallStatus;
    }

    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }

    public int getTotalFindings() {
        return totalFindings;
    }

    public void setTotalFindings(int totalFindings) {
        this.totalFindings = totalFindings;
    }

    public int getPassCount() {
        return passCount;
    }

    public void setPassCount(int passCount) {
        this.passCount = passCount;
    }

    public int getFailCount() {
        return failCount;
    }

    public void setFailCount(int failCount) {
        this.failCount = failCount;
    }

    public int getWarningCount() {
        return warningCount;
    }

    public void setWarningCount(int warningCount) {
        this.warningCount = warningCount;
    }

    public int getManualReviewCount() {
        return manualReviewCount;
    }

    public void setManualReviewCount(int manualReviewCount) {
        this.manualReviewCount = manualReviewCount;
    }

    public BigDecimal getAverageConfidence() {
        return averageConfidence;
    }

    public void setAverageConfidence(BigDecimal averageConfidence) {
        this.averageConfidence = averageConfidence;
    }

    public List<PrescreeningFindingResponse> getFindings() {
        return findings;
    }

    public void setFindings(List<PrescreeningFindingResponse> findings) {
        this.findings = findings;
    }

    public List<OcrExtractionResponse> getExtractions() {
        return extractions;
    }

    public void setExtractions(List<OcrExtractionResponse> extractions) {
        this.extractions = extractions;
    }
}
