package com.licensing.platform.dto;

import com.licensing.platform.model.enums.ApplicationStatus;
import java.time.Instant;

public class ApplicationSummaryResponse {

    private Long id;
    private String referenceNumber;
    private Long serviceId;
    private String serviceCode;
    private String serviceName;
    private Long departmentId;
    private String departmentName;
    private ApplicationStatus status;
    private Long citizenId;
    private String citizenName;
    private String citizenEmail;
    private Instant submittedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public ApplicationSummaryResponse() {
    }

    public ApplicationSummaryResponse(Long id, String referenceNumber, Long serviceId,
                                      String serviceCode, String serviceName,
                                      Long departmentId, String departmentName,
                                      ApplicationStatus status, Long citizenId,
                                      String citizenName, String citizenEmail,
                                      Instant submittedAt, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.referenceNumber = referenceNumber;
        this.serviceId = serviceId;
        this.serviceCode = serviceCode;
        this.serviceName = serviceName;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.status = status;
        this.citizenId = citizenId;
        this.citizenName = citizenName;
        this.citizenEmail = citizenEmail;
        this.submittedAt = submittedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(String serviceCode) {
        this.serviceCode = serviceCode;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public Long getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(Long citizenId) {
        this.citizenId = citizenId;
    }

    public String getCitizenName() {
        return citizenName;
    }

    public void setCitizenName(String citizenName) {
        this.citizenName = citizenName;
    }

    public String getCitizenEmail() {
        return citizenEmail;
    }

    public void setCitizenEmail(String citizenEmail) {
        this.citizenEmail = citizenEmail;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
