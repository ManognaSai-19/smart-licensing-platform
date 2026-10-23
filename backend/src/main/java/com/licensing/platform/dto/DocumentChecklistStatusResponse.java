package com.licensing.platform.dto;

import java.time.Instant;

public class DocumentChecklistStatusResponse {

    private Long requiredDocumentTypeId;
    private String documentCode;
    private String nameEn;
    private String nameTe;
    private boolean required;
    private String acceptedMimeTypes;
    private Long maxSizeBytes;
    private boolean isUploaded;
    private Long documentId;
    private String fileName;
    private String contentType;
    private Long fileSizeBytes;
    private Instant uploadedAt;
    private String previewUrl;
    private String downloadUrl;

    public DocumentChecklistStatusResponse() {
    }

    public DocumentChecklistStatusResponse(Long requiredDocumentTypeId, String documentCode, String nameEn,
                                           String nameTe, boolean required, String acceptedMimeTypes,
                                           Long maxSizeBytes, boolean isUploaded, Long documentId,
                                           String fileName, String contentType, Long fileSizeBytes,
                                           Instant uploadedAt, String previewUrl, String downloadUrl) {
        this.requiredDocumentTypeId = requiredDocumentTypeId;
        this.documentCode = documentCode;
        this.nameEn = nameEn;
        this.nameTe = nameTe;
        this.required = required;
        this.acceptedMimeTypes = acceptedMimeTypes;
        this.maxSizeBytes = maxSizeBytes;
        this.isUploaded = isUploaded;
        this.documentId = documentId;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
        this.uploadedAt = uploadedAt;
        this.previewUrl = previewUrl;
        this.downloadUrl = downloadUrl;
    }

    public Long getRequiredDocumentTypeId() {
        return requiredDocumentTypeId;
    }

    public void setRequiredDocumentTypeId(Long requiredDocumentTypeId) {
        this.requiredDocumentTypeId = requiredDocumentTypeId;
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

    public boolean isUploaded() {
        return isUploaded;
    }

    public void setUploaded(boolean uploaded) {
        isUploaded = uploaded;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getPreviewUrl() {
        return previewUrl;
    }

    public void setPreviewUrl(String previewUrl) {
        this.previewUrl = previewUrl;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }
}
