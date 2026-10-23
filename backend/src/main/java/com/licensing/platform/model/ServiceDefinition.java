package com.licensing.platform.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "services")
public class ServiceDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "sample_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal sampleFee = BigDecimal.ZERO;

    @Column(name = "processing_time_days", nullable = false)
    private Integer processingTimeDays = 7;

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<ServiceField> fields = new ArrayList<>();

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequiredDocumentType> requiredDocuments = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public ServiceDefinition() {
    }

    public ServiceDefinition(String code, String name, String description, Department department, BigDecimal sampleFee, Integer processingTimeDays) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.department = department;
        this.sampleFee = sampleFee != null ? sampleFee : BigDecimal.ZERO;
        this.processingTimeDays = processingTimeDays != null ? processingTimeDays : 7;
        this.active = true;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = Instant.now();
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

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
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

    public List<ServiceField> getFields() {
        return fields;
    }

    public void setFields(List<ServiceField> fields) {
        this.fields = fields;
    }

    public List<RequiredDocumentType> getRequiredDocuments() {
        return requiredDocuments;
    }

    public void setRequiredDocuments(List<RequiredDocumentType> requiredDocuments) {
        this.requiredDocuments = requiredDocuments;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ServiceDefinition that)) return false;
        return Objects.equals(id, that.id) || Objects.equals(code, that.code);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(code);
    }
}
