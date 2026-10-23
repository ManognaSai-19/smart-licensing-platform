package com.licensing.platform.model;

import com.licensing.platform.model.enums.FieldDataType;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "service_fields",
       uniqueConstraints = @UniqueConstraint(name = "uq_service_field", columnNames = {"service_id", "field_key"}))
public class ServiceField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceDefinition service;

    @Column(name = "field_key", nullable = false, length = 100)
    private String fieldKey;

    @Column(name = "label_en", nullable = false)
    private String labelEn;

    @Column(name = "label_te", nullable = false)
    private String labelTe;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false, length = 50)
    private FieldDataType dataType;

    @Column(name = "is_required", nullable = false)
    private boolean required = true;

    @Column(name = "validation_rules", columnDefinition = "TEXT")
    private String validationRules;

    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ServiceField() {
    }

    public ServiceField(ServiceDefinition service, String fieldKey, String labelEn, String labelTe,
                        FieldDataType dataType, boolean required, String validationRules, String optionsJson, Integer displayOrder) {
        this.service = service;
        this.fieldKey = fieldKey;
        this.labelEn = labelEn;
        this.labelTe = labelTe;
        this.dataType = dataType;
        this.required = required;
        this.validationRules = validationRules;
        this.optionsJson = optionsJson;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
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

    public String getFieldKey() {
        return fieldKey;
    }

    public void setFieldKey(String fieldKey) {
        this.fieldKey = fieldKey;
    }

    public String getLabelEn() {
        return labelEn;
    }

    public void setLabelEn(String labelEn) {
        this.labelEn = labelEn;
    }

    public String getLabelTe() {
        return labelTe;
    }

    public void setLabelTe(String labelTe) {
        this.labelTe = labelTe;
    }

    public FieldDataType getDataType() {
        return dataType;
    }

    public void setDataType(FieldDataType dataType) {
        this.dataType = dataType;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public String getValidationRules() {
        return validationRules;
    }

    public void setValidationRules(String validationRules) {
        this.validationRules = validationRules;
    }

    public String getOptionsJson() {
        return optionsJson;
    }

    public void setOptionsJson(String optionsJson) {
        this.optionsJson = optionsJson;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
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
        if (!(o instanceof ServiceField that)) return false;
        return Objects.equals(service, that.service) && Objects.equals(fieldKey, that.fieldKey);
    }

    @Override
    public int hashCode() {
        return Objects.hash(service, fieldKey);
    }
}
