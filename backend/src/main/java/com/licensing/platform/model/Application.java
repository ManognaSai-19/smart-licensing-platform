package com.licensing.platform.model;

import com.licensing.platform.model.enums.ApplicationStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", nullable = false, unique = true, length = 100)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceDefinition service;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @Column(name = "form_data", columnDefinition = "TEXT")
    private String formData;

    @Column(name = "language_preference", nullable = false, length = 10)
    private String languagePreference = "en";

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescreeningFinding> findings = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationStatusHistory> statusHistory = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Application() {
    }

    public Application(String referenceNumber, User citizen, ServiceDefinition service, String formData, String languagePreference) {
        this.referenceNumber = referenceNumber;
        this.citizen = citizen;
        this.service = service;
        this.formData = formData;
        this.languagePreference = languagePreference != null ? languagePreference : "en";
        this.status = ApplicationStatus.DRAFT;
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

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public User getCitizen() {
        return citizen;
    }

    public void setCitizen(User citizen) {
        this.citizen = citizen;
    }

    public ServiceDefinition getService() {
        return service;
    }

    public void setService(ServiceDefinition service) {
        this.service = service;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getFormData() {
        return formData;
    }

    public void setFormData(String formData) {
        this.formData = formData;
    }

    public String getLanguagePreference() {
        return languagePreference;
    }

    public void setLanguagePreference(String languagePreference) {
        this.languagePreference = languagePreference;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public List<ApplicationDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(List<ApplicationDocument> documents) {
        this.documents = documents;
    }

    public List<PrescreeningFinding> getFindings() {
        return findings;
    }

    public void setFindings(List<PrescreeningFinding> findings) {
        this.findings = findings;
    }

    public List<ApplicationStatusHistory> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<ApplicationStatusHistory> statusHistory) {
        this.statusHistory = statusHistory;
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
        if (!(o instanceof Application that)) return false;
        return Objects.equals(id, that.id) || Objects.equals(referenceNumber, that.referenceNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(referenceNumber);
    }
}
