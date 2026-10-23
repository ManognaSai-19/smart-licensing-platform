package com.licensing.platform.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "application_documents")
public class ApplicationDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_type_id", nullable = false)
    private RequiredDocumentType documentType;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "storage_key", nullable = false, unique = true)
    private String storageKey;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "file_checksum", length = 128)
    private String fileChecksum;

    @OneToOne(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private OcrExtraction ocrExtraction;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt = Instant.now();

    public ApplicationDocument() {
    }

    public ApplicationDocument(Application application, RequiredDocumentType documentType, String fileName,
                               String storageKey, String contentType, Long fileSizeBytes, String fileChecksum) {
        this.application = application;
        this.documentType = documentType;
        this.fileName = fileName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
        this.fileChecksum = fileChecksum;
        this.uploadedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public RequiredDocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(RequiredDocumentType documentType) {
        this.documentType = documentType;
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

    public OcrExtraction getOcrExtraction() {
        return ocrExtraction;
    }

    public void setOcrExtraction(OcrExtraction ocrExtraction) {
        this.ocrExtraction = ocrExtraction;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ApplicationDocument that)) return false;
        return Objects.equals(id, that.id) || Objects.equals(storageKey, that.storageKey);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(storageKey);
    }
}
