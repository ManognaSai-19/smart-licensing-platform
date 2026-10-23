package com.licensing.platform.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ServiceCreateRequest {

    @NotBlank(message = "Service code is required")
    @Size(min = 2, max = 50, message = "Service code must be between 2 and 50 characters")
    private String code;

    @NotBlank(message = "Service name is required")
    @Size(min = 2, max = 255, message = "Service name must be between 2 and 255 characters")
    private String name;

    private String description;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Sample fee is required")
    @DecimalMin(value = "0.00", message = "Fee cannot be negative")
    private BigDecimal sampleFee = BigDecimal.ZERO;

    @NotNull(message = "Processing time is required")
    @Min(value = 1, message = "Processing time must be at least 1 day")
    private Integer processingTimeDays = 7;

    private Boolean active = true;

    private List<ServiceFieldRequest> fields = new ArrayList<>();

    private List<RequiredDocumentTypeRequest> requiredDocuments = new ArrayList<>();

    public ServiceCreateRequest() {
    }

    public ServiceCreateRequest(String code, String name, String description, Long departmentId,
                                BigDecimal sampleFee, Integer processingTimeDays, Boolean active) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.departmentId = departmentId;
        this.sampleFee = sampleFee != null ? sampleFee : BigDecimal.ZERO;
        this.processingTimeDays = processingTimeDays != null ? processingTimeDays : 7;
        this.active = active != null ? active : true;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public BigDecimal getSampleFee() {
        return sampleFee;
    }

    public void setSampleFee(BigDecimal sampleFee) {
        this.sampleFee = sampleFee;
    }

    public Integer getProcessingTimeDays() {
        return processingTimeDays;
    }

    public void setProcessingTimeDays(Integer processingTimeDays) {
        this.processingTimeDays = processingTimeDays;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public List<ServiceFieldRequest> getFields() {
        return fields;
    }

    public void setFields(List<ServiceFieldRequest> fields) {
        this.fields = fields;
    }

    public List<RequiredDocumentTypeRequest> getRequiredDocuments() {
        return requiredDocuments;
    }

    public void setRequiredDocuments(List<RequiredDocumentTypeRequest> requiredDocuments) {
        this.requiredDocuments = requiredDocuments;
    }
}
