package com.licensing.platform.dto;

import com.licensing.platform.model.enums.ApplicationStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ApplicationDetailResponse extends ApplicationSummaryResponse {

    private Map<String, Object> formData;
    private String languagePreference;
    private List<ApplicationStatusHistoryResponse> statusHistory = new ArrayList<>();
    private List<ReviewDecisionResponse> reviewDecisions = new ArrayList<>();
    private List<RequiredDocumentTypeResponse> requiredDocuments = new ArrayList<>();
    private int documentCount;
    private int findingCount;

    public ApplicationDetailResponse() {
        super();
    }

    public ApplicationDetailResponse(Long id, String referenceNumber, Long serviceId,
                                     String serviceCode, String serviceName,
                                     Long departmentId, String departmentName,
                                     ApplicationStatus status, Long citizenId,
                                     String citizenName, String citizenEmail,
                                     Instant submittedAt, Instant createdAt, Instant updatedAt,
                                     Map<String, Object> formData, String languagePreference,
                                     List<ApplicationStatusHistoryResponse> statusHistory,
                                     List<ReviewDecisionResponse> reviewDecisions,
                                     List<RequiredDocumentTypeResponse> requiredDocuments,
                                     int documentCount, int findingCount) {
        super(id, referenceNumber, serviceId, serviceCode, serviceName, departmentId,
                departmentName, status, citizenId, citizenName, citizenEmail, submittedAt, createdAt, updatedAt);
        this.formData = formData;
        this.languagePreference = languagePreference;
        this.statusHistory = statusHistory != null ? statusHistory : new ArrayList<>();
        this.reviewDecisions = reviewDecisions != null ? reviewDecisions : new ArrayList<>();
        this.requiredDocuments = requiredDocuments != null ? requiredDocuments : new ArrayList<>();
        this.documentCount = documentCount;
        this.findingCount = findingCount;
    }

    public Map<String, Object> getFormData() {
        return formData;
    }

    public void setFormData(Map<String, Object> formData) {
        this.formData = formData;
    }

    public String getLanguagePreference() {
        return languagePreference;
    }

    public void setLanguagePreference(String languagePreference) {
        this.languagePreference = languagePreference;
    }

    public List<ApplicationStatusHistoryResponse> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<ApplicationStatusHistoryResponse> statusHistory) {
        this.statusHistory = statusHistory;
    }

    public List<ReviewDecisionResponse> getReviewDecisions() {
        return reviewDecisions;
    }

    public void setReviewDecisions(List<ReviewDecisionResponse> reviewDecisions) {
        this.reviewDecisions = reviewDecisions;
    }

    public List<RequiredDocumentTypeResponse> getRequiredDocuments() {
        return requiredDocuments;
    }

    public void setRequiredDocuments(List<RequiredDocumentTypeResponse> requiredDocuments) {
        this.requiredDocuments = requiredDocuments;
    }

    public int getDocumentCount() {
        return documentCount;
    }

    public void setDocumentCount(int documentCount) {
        this.documentCount = documentCount;
    }

    public int getFindingCount() {
        return findingCount;
    }

    public void setFindingCount(int findingCount) {
        this.findingCount = findingCount;
    }
}
