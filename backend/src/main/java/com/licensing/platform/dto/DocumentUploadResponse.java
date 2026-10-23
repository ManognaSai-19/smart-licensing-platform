package com.licensing.platform.dto;

import java.time.Instant;

public class DocumentUploadResponse {

    private Long id;
    private Long applicationId;
    private Long documentTypeId;
    private String documentTypeCode;
    private String documentTypeNameEn;
    private String documentTypeNameTe;
    private String fileName;
    private String storageKey;
    private String contentType;
    private Long fileSizeBytes;
    private String fileChecksum;
    private Instant uploadedAt;
    private String previewUrl;
    private String downloadUrl;

    public DocumentUploadResponse() {
    }

    public DocumentUploadResponse(Long id, Long applicationId, Long documentTypeId, String documentTypeCode,
                                  String documentTypeNameEn, String documentTypeNameTe, String fileName,
                                  String storageKey, String contentType, Long fileSizeBytes,
                                  String fileChecksum, Instant uploadedAt, String previewUrl, String downloadUrl) {
        this.id = id;
        this.applicationId = applicationId;
        this.documentTypeId = documentTypeId;
        this.documentTypeCode = documentTypeCode;
        this.documentTypeNameEn = documentTypeNameEn;
        this.documentTypeNameTe = documentTypeNameTe;
        this.fileName = fileName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
        this.fileChecksum = fileChecksum;
        this.uploadedAt = uploadedAt;
        this.previewUrl = previewUrl;
        this.downloadUrl = downloadUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public Long getDocumentTypeId() {
        return documentTypeId;
    }

    public void setDocumentTypeId(Long documentTypeId) {
        this.documentTypeId = documentTypeId;
    }

    public String getDocumentTypeCode() {
        return documentTypeCode;
    }

    public void setDocumentTypeCode(String documentTypeCode) {
        this.documentTypeCode = documentTypeCode;
    }

    public String getDocumentTypeNameEn() {
        return documentTypeNameEn;
    }

    public void setDocumentTypeNameEn(String documentTypeNameEn) {
        this.documentTypeNameEn = documentTypeNameEn;
    }

    public String getDocumentTypeNameTe() {
        return documentTypeNameTe;
    }

    public void setDocumentTypeNameTe(String documentTypeNameTe) {
        this.documentTypeNameTe = documentTypeNameTe;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public void setStorageKey(String storageKey) {
        this.storageKey = storageKey;
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

    public String getFileChecksum() {
        return fileChecksum;
    }

    public void setFileChecksum(String fileChecksum) {
        this.fileChecksum = fileChecksum;
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
