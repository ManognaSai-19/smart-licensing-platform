package com.licensing.platform.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class ServiceSummaryResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private Long departmentId;
    private String departmentCode;
    private String departmentName;
    private boolean active;
    private BigDecimal sampleFee;
    private Integer processingTimeDays;
    private int fieldCount;
    private int documentCount;
    private Instant createdAt;

    public ServiceSummaryResponse() {
    }

    public ServiceSummaryResponse(Long id, String code, String name, String description,
                                  Long departmentId, String departmentCode, String departmentName,
                                  boolean active, BigDecimal sampleFee, Integer processingTimeDays,
                                  int fieldCount, int documentCount, Instant createdAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.departmentId = departmentId;
        this.departmentCode = departmentCode;
        this.departmentName = departmentName;
        this.active = active;
        this.sampleFee = sampleFee;
        this.processingTimeDays = processingTimeDays;
        this.fieldCount = fieldCount;
        this.documentCount = documentCount;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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

    public int getFieldCount() {
        return fieldCount;
    }

    public void setFieldCount(int fieldCount) {
        this.fieldCount = fieldCount;
    }

    public int getDocumentCount() {
        return documentCount;
    }

    public void setDocumentCount(int documentCount) {
        this.documentCount = documentCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
