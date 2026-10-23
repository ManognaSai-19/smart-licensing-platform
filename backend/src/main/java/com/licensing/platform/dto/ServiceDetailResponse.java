package com.licensing.platform.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ServiceDetailResponse extends ServiceSummaryResponse {

    private List<ServiceFieldResponse> fields = new ArrayList<>();
    private List<RequiredDocumentTypeResponse> requiredDocuments = new ArrayList<>();

    public ServiceDetailResponse() {
        super();
    }

    public ServiceDetailResponse(Long id, String code, String name, String description,
                                 Long departmentId, String departmentCode, String departmentName,
                                 boolean active, BigDecimal sampleFee, Integer processingTimeDays,
                                 int fieldCount, int documentCount, Instant createdAt,
                                 List<ServiceFieldResponse> fields,
                                 List<RequiredDocumentTypeResponse> requiredDocuments) {
        super(id, code, name, description, departmentId, departmentCode, departmentName,
                active, sampleFee, processingTimeDays, fieldCount, documentCount, createdAt);
        this.fields = fields != null ? fields : new ArrayList<>();
        this.requiredDocuments = requiredDocuments != null ? requiredDocuments : new ArrayList<>();
    }

    public List<ServiceFieldResponse> getFields() {
        return fields;
    }

    public void setFields(List<ServiceFieldResponse> fields) {
        this.fields = fields;
    }

    public List<RequiredDocumentTypeResponse> getRequiredDocuments() {
        return requiredDocuments;
    }

    public void setRequiredDocuments(List<RequiredDocumentTypeResponse> requiredDocuments) {
        this.requiredDocuments = requiredDocuments;
    }
}
