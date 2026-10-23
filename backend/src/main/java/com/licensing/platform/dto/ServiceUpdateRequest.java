package com.licensing.platform.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class ServiceUpdateRequest {

    @Size(min = 2, max = 255, message = "Service name must be between 2 and 255 characters")
    private String name;

    private String description;

    private Long departmentId;

    @DecimalMin(value = "0.00", message = "Fee cannot be negative")
    private BigDecimal sampleFee;

    @Min(value = 1, message = "Processing time must be at least 1 day")
    private Integer processingTimeDays;

    private Boolean active;

    public ServiceUpdateRequest() {
    }

    public ServiceUpdateRequest(String name, String description, Long departmentId,
                                BigDecimal sampleFee, Integer processingTimeDays, Boolean active) {
        this.name = name;
        this.description = description;
        this.departmentId = departmentId;
        this.sampleFee = sampleFee;
        this.processingTimeDays = processingTimeDays;
        this.active = active;
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
}
