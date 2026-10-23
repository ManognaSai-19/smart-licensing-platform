package com.licensing.platform.dto;

public class RequiredDocumentTypeResponse {

    private Long id;
    private String documentCode;
    private String nameEn;
    private String nameTe;
    private boolean required;
    private String acceptedMimeTypes;
    private Long maxSizeBytes;

    public RequiredDocumentTypeResponse() {
    }

    public RequiredDocumentTypeResponse(Long id, String documentCode, String nameEn, String nameTe,
                                        boolean required, String acceptedMimeTypes, Long maxSizeBytes) {
        this.id = id;
        this.documentCode = documentCode;
        this.nameEn = nameEn;
        this.nameTe = nameTe;
        this.required = required;
        this.acceptedMimeTypes = acceptedMimeTypes;
        this.maxSizeBytes = maxSizeBytes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
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
