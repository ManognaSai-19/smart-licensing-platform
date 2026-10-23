package com.licensing.platform.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "required_document_types",
       uniqueConstraints = @UniqueConstraint(name = "uq_service_doc_code", columnNames = {"service_id", "document_code"}))
public class RequiredDocumentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceDefinition service;

    @Column(name = "document_code", nullable = false, length = 100)
    private String documentCode;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "name_te", nullable = false)
    private String nameTe;

    @Column(name = "is_required", nullable = false)
    private boolean required = true;

    @Column(name = "accepted_mime_types", nullable = false)
    private String acceptedMimeTypes = "image/jpeg,image/png,application/pdf";

    @Column(name = "max_size_bytes", nullable = false)
    private Long maxSizeBytes = 5242880L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public RequiredDocumentType() {
    }

    public RequiredDocumentType(ServiceDefinition service, String documentCode, String nameEn, String nameTe,
                                boolean required, String acceptedMimeTypes, Long maxSizeBytes) {
        this.service = service;
        this.documentCode = documentCode;
        this.nameEn = nameEn;
        this.nameTe = nameTe;
        this.required = required;
        this.acceptedMimeTypes = acceptedMimeTypes != null ? acceptedMimeTypes : "image/jpeg,image/png,application/pdf";
        this.maxSizeBytes = maxSizeBytes != null ? maxSizeBytes : 5242880L;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ServiceDefinition getService() {
        return service;
    }

    public void setService(ServiceDefinition service) {
        this.service = service;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RequiredDocumentType that)) return false;
        return Objects.equals(service, that.service) && Objects.equals(documentCode, that.documentCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(service, documentCode);
    }
}
