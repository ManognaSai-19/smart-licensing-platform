package com.licensing.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RequiredDocumentTypeRequest {

    @NotBlank(message = "Document code is required")
    @Size(min = 1, max = 100, message = "Document code must be between 1 and 100 characters")
    private String documentCode;

    @NotBlank(message = "English document name is required")
    private String nameEn;

    private String nameTe;

    private Boolean required = true;

    private String acceptedMimeTypes = "image/jpeg,image/png,application/pdf";

    private Long maxSizeBytes = 5242880L;

    public RequiredDocumentTypeRequest() {
    }

    public RequiredDocumentTypeRequest(String documentCode, String nameEn, String nameTe,
                                       Boolean required, String acceptedMimeTypes, Long maxSizeBytes) {
        this.documentCode = documentCode;
        this.nameEn = nameEn;
        this.nameTe = nameTe;
        this.required = required != null ? required : true;
        this.acceptedMimeTypes = acceptedMimeTypes != null ? acceptedMimeTypes : "image/jpeg,image/png,application/pdf";
        this.maxSizeBytes = maxSizeBytes != null ? maxSizeBytes : 5242880L;
    }

    public String getDocumentCode() {
        return documentCode;
    }

    public void setDocumentCode(String documentCode) {
        this.documentCode = documentCode;
    }

    public String getNameEn() {
        return nameEn;
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }

    public String getNameTe() {
        return nameTe;
    }

    public void setNameTe(String nameTe) {
        this.nameTe = nameTe;
    }

    public Boolean getRequired() {
        return required;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }

    public String getAcceptedMimeTypes() {
        return acceptedMimeTypes;
    }

    public void setAcceptedMimeTypes(String acceptedMimeTypes) {
        this.acceptedMimeTypes = acceptedMimeTypes;
    }

    public Long getMaxSizeBytes() {
        return maxSizeBytes;
    }

    public void setMaxSizeBytes(Long maxSizeBytes) {
        this.maxSizeBytes = maxSizeBytes;
    }
}
